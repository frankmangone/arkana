import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getSubscriptionStatus,
  subscribeGuest,
  subscribeAuthenticated,
  unsubscribeAuthenticated,
  confirmSubscription,
  unsubscribeByToken,
  SubscriptionStatusResponse,
  SubscribeResponse,
  ConfirmResponse,
  UnsubscribeResponse,
} from "../services/subscriptions";
import { trackEvent, EVENTS } from "@/lib/analytics";

export const subscriptionKeys = {
  all: ["subscriptions"] as const,
  status: () => [...subscriptionKeys.all, "status"] as const,
};

/**
 * Server-truth subscription status for the current user. Pass
 * `enabled: false` while logged out — there's no session to check status
 * against, and the endpoint requires auth.
 */
export function useSubscriptionStatus(enabled: boolean) {
  return useQuery<SubscriptionStatusResponse, Error>({
    queryKey: subscriptionKeys.status(),
    queryFn: getSubscriptionStatus,
    enabled,
  });
}

export function useSubscribeGuest() {
  return useMutation<SubscribeResponse, Error, string>({
    mutationFn: (email: string) => subscribeGuest(email),
    onSuccess: () => {
      trackEvent(EVENTS.SUBSCRIBE_GUEST_SUBMITTED);
    },
  });
}

/**
 * Invalidates the status query on success so any mounted eligibility check
 * picks up the new "subscribed" state on its next read.
 */
export function useSubscribeAuthenticated() {
  const queryClient = useQueryClient();

  return useMutation<SubscriptionStatusResponse, Error, void>({
    mutationFn: () => subscribeAuthenticated(),
    onSuccess: () => {
      trackEvent(EVENTS.SUBSCRIBE_AUTHENTICATED);
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
    },
  });
}

/**
 * Invalidates the status query on success, same as useSubscribeAuthenticated.
 */
export function useUnsubscribeAuthenticated() {
  const queryClient = useQueryClient();

  return useMutation<SubscriptionStatusResponse, Error, void>({
    mutationFn: () => unsubscribeAuthenticated(),
    onSuccess: () => {
      trackEvent(EVENTS.UNSUBSCRIBE_AUTHENTICATED);
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
    },
  });
}

export function useConfirmSubscription() {
  return useMutation<
    ConfirmResponse,
    Error,
    { subscriberId: number; token: string }
  >({
    mutationFn: ({ subscriberId, token }) =>
      confirmSubscription(subscriberId, token),
    onSuccess: () => {
      trackEvent(EVENTS.SUBSCRIPTION_CONFIRMED);
    },
  });
}

export function useUnsubscribeByToken() {
  return useMutation<
    UnsubscribeResponse,
    Error,
    { subscriberId: number; token: string }
  >({
    mutationFn: ({ subscriberId, token }) =>
      unsubscribeByToken(subscriberId, token),
    onSuccess: () => {
      trackEvent(EVENTS.SUBSCRIPTION_UNSUBSCRIBED);
    },
  });
}
