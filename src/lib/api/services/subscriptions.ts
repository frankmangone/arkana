import apiClient from "../client";

export interface SubscriptionStatusResponse {
  subscribed: boolean;
}

export interface SubscribeResponse {
  status: string;
}

export interface ConfirmResponse {
  confirmed: boolean;
}

export interface UnsubscribeResponse {
  unsubscribed: boolean;
}

/**
 * Get the current user's subscription status. JWT auth required.
 */
export async function getSubscriptionStatus(): Promise<SubscriptionStatusResponse> {
  const response = await apiClient.get<SubscriptionStatusResponse>(
    "/api/subscriptions"
  );
  return response.data;
}

/**
 * Guest signup — always resolves with status "pending" regardless of what
 * happened internally, so it never discloses whether an email is registered.
 */
export async function subscribeGuest(
  email: string
): Promise<SubscribeResponse> {
  const response = await apiClient.post<SubscribeResponse>("/api/subscribe", {
    email,
  });
  return response.data;
}

/**
 * One-click subscribe for a logged-in user. JWT auth required.
 */
export async function subscribeAuthenticated(): Promise<SubscriptionStatusResponse> {
  const response = await apiClient.post<SubscriptionStatusResponse>(
    "/api/subscriptions"
  );
  return response.data;
}

/**
 * Confirms a pending guest subscription from the emailed link.
 */
export async function confirmSubscription(
  subscriberId: number,
  token: string
): Promise<ConfirmResponse> {
  const response = await apiClient.post<ConfirmResponse>(
    "/api/subscribe/confirm",
    { subscriber_id: subscriberId, token }
  );
  return response.data;
}

/**
 * Public, no-login unsubscribe from the emailed link.
 */
export async function unsubscribeByToken(
  subscriberId: number,
  token: string
): Promise<UnsubscribeResponse> {
  const response = await apiClient.post<UnsubscribeResponse>(
    "/api/subscriptions/unsubscribe",
    { subscriber_id: subscriberId, token }
  );
  return response.data;
}
