import AsyncStorage from '@react-native-async-storage/async-storage';

let queue = Promise.resolve();
const deletedAccounts = new Set<string>();
const accountKeys = (id: string | number) => [`itc:saved:${id}`, `itc:recent-searches:${id}`];

/** Serialize personal cache writes with deletion, so a late write cannot restore removed data. */
export function saveAccountLocalItem(key: string, value: string): Promise<void> {
  queue = queue.catch(() => undefined).then(async () => {
    if ([...deletedAccounts].some(id => accountKeys(id).includes(key))) return;
    await AsyncStorage.setItem(key, value);
  });
  return queue;
}

export function deleteAccountLocalData(id: string | number): Promise<void> {
  deletedAccounts.add(String(id));
  queue = queue.catch(() => undefined).then(async () => {
    await AsyncStorage.setItem('itc:pending-local-deletion', String(id));
    await AsyncStorage.multiRemove(accountKeys(id));
    await AsyncStorage.removeItem('itc:pending-local-deletion');
  });
  return queue;
}

export async function resumeAccountLocalDeletion(): Promise<void> {
  const id = await AsyncStorage.getItem('itc:pending-local-deletion');
  if (id != null) await deleteAccountLocalData(id);
}
