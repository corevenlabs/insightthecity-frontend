// An in-memory, account-scoped request. Session restoration and ordinary navigation do not queue it.
let pendingUserId: number | null = null;
const listeners = new Set<() => void>();
export function queueHomeEntrance(userId: number) {
  pendingUserId = userId;
  listeners.forEach(listener => listener());
}
export function consumeHomeEntrance(userId: number | undefined) {
  if (userId == null || pendingUserId !== userId) return false;
  pendingUserId = null;
  return true;
}
export function clearHomeEntrance() { pendingUserId = null; }
export function subscribeHomeEntrance(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
