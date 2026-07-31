import type { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { PendingActionType, PendingIntent } from "./pending-action-types";
import { createPendingActionRegistry } from "./pending-action-registry";

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

export async function resumePendingIntent(
  queryClient: QueryClient,
  fallbackReturnTo: string,
  now: number = Date.now()
): Promise<string> {
  const intent = consumePendingIntent(now);
  if (intent?.action) {
    try {
      const registry = createPendingActionRegistry(queryClient);
      await registry[intent.action.type](intent.action.payload);
    } catch {
      toast.error("Couldn't complete that action - try again.");
    }
  }
  return intent?.returnTo ?? fallbackReturnTo;
}
