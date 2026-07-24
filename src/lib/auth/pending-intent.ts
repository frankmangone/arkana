import type { PendingActionType, PendingIntent } from "./pending-action-types";

const STORAGE_KEY = "arkana_pending_intent";
const TTL_MS = 10 * 60 * 1000;

export function setPendingIntent<T extends PendingActionType>(
  intent: Omit<PendingIntent<T>, "createdAt">,
  now: number = Date.now()
): void {
  const withTimestamp: PendingIntent<T> = { ...intent, createdAt: now };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(withTimestamp));
}

export function consumePendingIntent(
  now: number = Date.now()
): PendingIntent | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (raw === null) return null;

  sessionStorage.removeItem(STORAGE_KEY);

  try {
    const intent = JSON.parse(raw) as PendingIntent;
    if (now - intent.createdAt > TTL_MS) return null;
    return intent;
  } catch {
    return null;
  }
}
