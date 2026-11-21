import AsyncStorage from '@react-native-async-storage/async-storage';
import { requireOptionalNativeModule } from 'expo';
import Constants from 'expo-constants';
import { Linking, Platform } from 'react-native';

import { API_URL } from '../constants/api';
import type { AppLanguage } from '../i18n/ui';

type NotificationsModule = typeof import('expo-notifications');
export type PushPermission = 'unsupported' | 'granted' | 'undetermined' | 'denied';

// Android notification channel for account and membership notices (must match the backend's channelId).
export const ACCOUNT_CHANNEL = 'account';
const STORED_TOKEN_KEY = 'itc_push_token';
const CHANNEL_NAMES: Record<AppLanguage, string> = { es: 'Cuenta y membresía', en: 'Account and membership', pt: 'Conta e assinatura' };
// Only in-app routes the backend sends; anything else is ignored.
const ALLOWED_ROUTE = /^\/(club|profile|home|experience-detail|news-detail)(\?[A-Za-z0-9_=&%.-]*)?$/;

let cachedModule: NotificationsModule | null | undefined;
// Lazy require: a binary without the native module (web, older builds) must keep working.
export function notificationsModule(): NotificationsModule | null {
  if (cachedModule !== undefined) return cachedModule;
  if (Platform.OS === 'web' || !requireOptionalNativeModule('ExpoNotificationPermissionsModule')) {
    cachedModule = null;
    return null;
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  cachedModule = require('expo-notifications') as NotificationsModule;
  return cachedModule;
}

export function safeNotificationRoute(value: unknown): string | null {
  return typeof value === 'string' && ALLOWED_ROUTE.test(value) ? value : null;
}

async function request(path: string, method: string, authToken: string, body?: unknown) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    const response = await fetch(`${API_URL}${path}`, {
      method,
      headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
  } finally {
    clearTimeout(timer);
  }
}

export async function pushPermission(): Promise<PushPermission> {
  const Notifications = notificationsModule();
  if (!Notifications) return 'unsupported';
  try {
    const settings = await Notifications.getPermissionsAsync();
    if (Platform.OS === 'ios') {
      const status = settings.ios?.status;
      if (status === Notifications.IosAuthorizationStatus.NOT_DETERMINED) return 'undetermined';
      if (status === Notifications.IosAuthorizationStatus.DENIED) return 'denied';
      return settings.granted ? 'granted' : 'denied';
    }
    if (settings.granted) return 'granted';
    return settings.canAskAgain ? 'undetermined' : 'denied';
  } catch {
    return 'unsupported';
  }
}

async function ensureChannel(Notifications: NotificationsModule, language: AppLanguage) {
  if (Platform.OS !== 'android') return;
  // Android 13+ only shows the permission prompt once a channel exists.
  await Notifications.setNotificationChannelAsync(ACCOUNT_CHANNEL, {
    name: CHANNEL_NAMES[language] ?? CHANNEL_NAMES.es,
    importance: Notifications.AndroidImportance.HIGH,
  });
}

// Registers this device for the signed-in account. Never prompts; returns false when it could not register.
export async function syncPushToken(authToken: string | null, language: AppLanguage): Promise<boolean> {
  const Notifications = notificationsModule();
  if (!Notifications || !authToken) return false;
  try {
    if (await pushPermission() !== 'granted') return false;
    await ensureChannel(Notifications, language);
    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    if (!projectId) return false;
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    await request('/api/users/me/push-token', 'PUT', authToken, { token, platform: Platform.OS });
    await AsyncStorage.setItem(STORED_TOKEN_KEY, token);
    return true;
  } catch {
    return false;
  }
}

// Asks for permission (only call it from a user action) and registers the device when granted.
export async function enablePushNotifications(authToken: string | null, language: AppLanguage): Promise<PushPermission> {
  const Notifications = notificationsModule();
  if (!Notifications) return 'unsupported';
  const current = await pushPermission();
  if (current === 'undetermined') {
    try {
      await ensureChannel(Notifications, language);
      await Notifications.requestPermissionsAsync();
    } catch {
      return 'unsupported';
    }
  }
  const result = await pushPermission();
  if (result === 'granted') await syncPushToken(authToken, language);
  return result;
}

// On sign-out the device stops receiving the previous account's notices.
export async function unregisterPushToken(authToken: string | null): Promise<void> {
  const token = await AsyncStorage.getItem(STORED_TOKEN_KEY).catch(() => null);
  if (!token) return;
  await AsyncStorage.removeItem(STORED_TOKEN_KEY).catch(() => undefined);
  if (!authToken) return;
  await request('/api/users/me/push-token', 'DELETE', authToken, { token }).catch(() => undefined);
}

export async function setAccountNotices(authToken: string, enabled: boolean): Promise<void> {
  await request('/api/users/me/notification-preferences', 'PATCH', authToken, { account: enabled });
}

export function openNotificationSettings() {
  void Linking.openSettings().catch(() => undefined);
}
