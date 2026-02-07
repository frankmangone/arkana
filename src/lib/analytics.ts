/**
 * Simple Analytics event tracking utility.
 * Handles the case where SA script isn't loaded (dev mode).
 */

type EventMetadata = Record<string, string | number | boolean>;

declare global {
  interface Window {
    sa_event?: (event: string, metadata?: EventMetadata) => void;
  }
}

export function trackEvent(event: string, metadata?: EventMetadata): void {
  if (typeof window !== "undefined" && window.sa_event) {
    window.sa_event(event, metadata);
  }
}

// Event names as constants for consistency
export const EVENTS = {
  COFFEE_PURCHASED: "coffee_purchased",
  COFFEE_INITIATED: "coffee_initiated",
  POST_LIKED: "post_liked",
  POST_UNLIKED: "post_unliked",
  COMMENT_CREATED: "comment_created",
  WALLET_CONNECTED: "wallet_connected",
  WALLET_DISCONNECTED: "wallet_disconnected",
  QUIZ_SUBMITTED: "quiz_submitted",
} as const;
