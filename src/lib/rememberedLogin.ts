import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const KEY = 'itc_remembered_login_v1';
type Credentials = { email: string; password: string };
let queue: Promise<void> = Promise.resolve();
export async function readRememberedLogin(): Promise<Credentials | null> {
  if (Platform.OS === 'web') return null;
  await queue.catch(() => undefined);
  const raw = await SecureStore.getItemAsync(KEY);
  if (!raw) return null;
  try {
    const value = JSON.parse(raw);
    if (typeof value.email === 'string' && value.email.trim() && typeof value.password === 'string' && value.password) return { email: value.email, password: value.password };
  } catch { /* Invalid local data is removed rather than filled into the form. */ }
  await clearRememberedLogin();
  return null;
}
export function saveRememberedLogin(email: string, password: string): Promise<void> {
  queue = queue.catch(() => undefined).then(async () => {
    if (Platform.OS === 'web') return;
    if (!email.trim() || !password) throw new Error('Invalid credentials');
    await SecureStore.setItemAsync(KEY, JSON.stringify({ email: email.trim(), password }), { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY });
  });
  return queue;
}
export function clearRememberedLogin(): Promise<void> {
  queue = queue.catch(() => undefined).then(async () => {
    if (Platform.OS !== 'web') await SecureStore.deleteItemAsync(KEY);
  });
  return queue;
}
