"use client";

import { usePathname, useParams, useRouter } from "next/navigation";
import { setPendingIntent } from "./pending-intent";
import type { PendingAction, PendingActionType } from "./pending-action-types";

export function useRequireAuth() {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const lang = (params?.lang as string) || "en";

  return <T extends PendingActionType>(action?: PendingAction<T>) => {
    setPendingIntent({ returnTo: pathname, action });
    router.push(`/${lang}/login`);
  };
}
