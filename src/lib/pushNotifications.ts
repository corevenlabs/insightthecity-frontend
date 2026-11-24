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
// Android channel for news and promotions sent from the panel (separate opt-in).
export const PROMOTIONS_CHANNEL = 'promotions';
const STORED_TOKEN_KEY = 'itc_push_token';
// Token waiting to be unlinked on the server; it is retried until the server confirms.
const RELEASE_KEY = 'itc_push_token_release';
// Version of the texts next to the switches. Change it whenever those texts change.
const TEXT_VERSION = 'push-2026-11';
const CHANNEL_NAMES: Record<AppLanguage, string> = { es: 'Cuenta y membresía', en: 'Account and membership', pt: 'Conta e assinatura' };
const SAVED_CHANNEL_NAMES: Record<AppLanguage, string> = { es: 'Recordatorios de guardados', en: 'Saved reminders', pt: 'Lembretes de salvos' };
const PROMOTIONS_CHANNEL_NAMES: Record<AppLanguage, string> = { es: 'Novedades y promociones', en: 'News and promotions', pt: 'Novidades e promoções' };
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

// Linking and unlinking run one after another, so a late unlink never undoes a newer link.
let chain: Promise<unknown> = Promise.resolve();
function inOrder<T>(work: () => Promise<T>): Promise<T> {
  const result = chain.then(work);
  chain = result.catch(() => undefined);
  return result;
}

async function request(path: string, method: string, authToken: string | null, body?: unknown) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    const response = await fetch(`${API_URL}${path}`, {
      method,
      headers: { ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}), 'Content-Type': 'application/json' },
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
  await Notifications.setNotificationChannelAsync('saved', {
    name: SAVED_CHANNEL_NAMES[language] ?? SAVED_CHANNEL_NAMES.es,
    importance: Notifications.AndroidImportance.DEFAULT,
  });
  await Notifications.setNotificationChannelAsync(PROMOTIONS_CHANNEL, {
    name: PROMOTIONS_CHANNEL_NAMES[language] ?? PROMOTIONS_CHANNEL_NAMES.es,
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

// Registers this device for the signed-in account. Never prompts; returns false when it could not register.
export function syncPushToken(authToken: string | null, language: AppLanguage): Promise<boolean> {
  return inOrder(() => register(authToken, language));
}

async function register(authToken: string | null, language: AppLanguage): Promise<boolean> {
  const Notifications = notificationsModule();
  if (!Notifications || !authToken) return false;
  try {
    const permission = await pushPermission();
    if (permission !== 'granted') {
      // The person turned notifications off in the phone settings.
      if (permission !== 'unsupported') await release();
      return false;
    }
    await ensureChannel(Notifications, language);
    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    if (!projectId) return false;
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    await request('/api/users/me/push-token', 'PUT', authToken, { token, platform: Platform.OS });
    await AsyncStorage.setItem(STORED_TOKEN_KEY, token);
    if (await AsyncStorage.getItem(RELEASE_KEY) === token) await AsyncStorage.removeItem(RELEASE_KEY);
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

// Unlinks this device. It needs no session, so it also works after one expired and can be retried later.
async function release(): Promise<void> {
  const stored = await AsyncStorage.getItem(STORED_TOKEN_KEY);
  if (stored) {
    await AsyncStorage.setItem(RELEASE_KEY, stored);
    await AsyncStorage.removeItem(STORED_TOKEN_KEY);
  }
  const token = await AsyncStorage.getItem(RELEASE_KEY);
  if (!token) return;
  await request('/api/users/push-token/release', 'POST', null, { token });
  await AsyncStorage.removeItem(RELEASE_KEY);
}

// On sign-out the device stops receiving the previous account's notices.
export function unregisterPushToken(): Promise<void> {
  return inOrder(release).catch(() => undefined);
}

// Back in the foreground: applies a permission changed in the phone settings and finishes pending unlinks.
export function refreshPushRegistration(authToken: string | null, language: AppLanguage): Promise<void> {
  return inOrder(async () => {
    if (!authToken) return release();
    const [permission, stored] = [await pushPermission(), await AsyncStorage.getItem(STORED_TOKEN_KEY)];
    if (permission === 'unsupported') return;
    if (permission === 'granted' ? !stored : stored || await AsyncStorage.getItem(RELEASE_KEY)) await register(authToken, language);
  }).catch(() => undefined);
}

export async function setAccountNotices(authToken: string, enabled: boolean): Promise<void> {
  await request('/api/users/me/notification-preferences', 'PATCH', authToken, { account: enabled });
}

// Reminders and promotions are off until the person turns them on (Apple guideline 4.5.4).
export async function setSavedReminders(authToken: string, enabled: boolean): Promise<void> {
  await request('/api/users/me/notification-preferences', 'PATCH', authToken, { saved: enabled, textVersion: TEXT_VERSION });
}

// Mirrors the saved experiences on the server so it can send reminders. The device stays the source of truth.
export async function syncSavedExperiences(authToken: string, ids: string[]): Promise<void> {
  await request('/api/users/me/saved-experiences', 'PUT', authToken, { ids: [...new Set(ids)].slice(0, 300) });
}

export async function setPromotionNotices(authToken: string, enabled: boolean): Promise<void> {
  await request('/api/users/me/notification-preferences', 'PATCH', authToken, { promotions: enabled, textVersion: TEXT_VERSION });
}

// Campaign id carried by a panel notification, or null.
export function notificationCampaign(value: unknown): number | null {
  const id = typeof value === 'number' ? value : typeof value === 'string' && /^\d{1,9}$/.test(value) ? Number(value) : NaN;
  return Number.isInteger(id) && id > 0 ? id : null;
}

// Lets the panel count opens. Best effort.
export async function recordPushOpen(authToken: string, campaign: number): Promise<void> {
  await request('/api/users/me/push-opens', 'POST', authToken, { campaign }).catch(() => undefined);
}

export function openNotificationSettings() {
  void Linking.openSettings().catch(() => undefined);
}
