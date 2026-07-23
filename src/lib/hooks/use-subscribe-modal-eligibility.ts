"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { useSubscriptionStatus } from "@/lib/api/hooks/useSubscriptions";
import { shouldShowSubscribeModal } from "@/lib/subscribe-modal/eligibility";

const LAST_SHOWN_KEY = "subscribe_modal_last_shown";
const GUEST_SUBSCRIBED_KEY = "subscribe_modal_guest_subscribed";
const EXCLUDED_ROUTES = [
  "/subscribe/confirm",
  "/unsubscribe",
  "/login",
  "/auth",
];

function isExcludedRoute(pathname: string | null): boolean {
  if (!pathname) {
    return false;
  }
  return EXCLUDED_ROUTES.some((route) => pathname.includes(route));
}

function readLastShownAt(): Date | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = localStorage.getItem(LAST_SHOWN_KEY);
  return raw ? new Date(raw) : null;
}

function readGuestAlreadySubscribed(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return localStorage.getItem(GUEST_SUBSCRIBED_KEY) === "true";
}

export function useSubscribeModalEligibility() {
  const pathname = usePathname();
  const { user } = useAuth();
  const isLoggedIn = !!user;
  const {
    data: statusData,
    isLoading: statusLoading,
    isError: statusErrored,
  } = useSubscriptionStatus(isLoggedIn);

  const isSubscribed = isLoggedIn
    ? statusLoading || statusErrored
      ? undefined
      : statusData?.subscribed
    : undefined;

  const isEligible = shouldShowSubscribeModal({
    now: new Date(),
    lastShownAt: readLastShownAt(),
    isLoggedIn,
    isSubscribed,
    guestAlreadySubscribed: readGuestAlreadySubscribed(),
    isExcludedRoute: isExcludedRoute(pathname),
  });

  const markShown = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LAST_SHOWN_KEY, new Date().toISOString());
    }
  };

  const markGuestSubscribed = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(GUEST_SUBSCRIBED_KEY, "true");
    }
  };

  return { isEligible, isLoggedIn, markShown, markGuestSubscribed };
}
