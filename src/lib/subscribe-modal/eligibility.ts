export interface SubscribeModalEligibilityParams {
  now: Date;
  lastShownAt: Date | null;
  isLoggedIn: boolean;
  isSubscribed: boolean | undefined;
  guestAlreadySubscribed: boolean;
  isExcludedRoute: boolean;
}

const COOLDOWN_MS = 24 * 60 * 60 * 1000;

export function shouldShowSubscribeModal(
  params: SubscribeModalEligibilityParams
): boolean {
  const {
    now,
    lastShownAt,
    isLoggedIn,
    isSubscribed,
    guestAlreadySubscribed,
    isExcludedRoute,
  } = params;

  if (isExcludedRoute) {
    return false;
  }

  if (isLoggedIn) {
    if (isSubscribed === undefined || isSubscribed) {
      return false;
    }
  } else if (guestAlreadySubscribed) {
    return false;
  }

  if (lastShownAt && now.getTime() - lastShownAt.getTime() < COOLDOWN_MS) {
    return false;
  }

  return true;
}
