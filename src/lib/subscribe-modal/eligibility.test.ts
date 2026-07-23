import { describe, it, expect } from "vitest";
import { shouldShowSubscribeModal } from "./eligibility";

const NOW = new Date("2026-07-23T12:00:00.000Z");
const HOUR = 60 * 60 * 1000;

function hoursAgo(hours: number): Date {
  return new Date(NOW.getTime() - hours * HOUR);
}

describe("shouldShowSubscribeModal", () => {
  const baseParams = {
    now: NOW,
    lastShownAt: null,
    isLoggedIn: false,
    isSubscribed: undefined as boolean | undefined,
    guestAlreadySubscribed: false,
    isExcludedRoute: false,
  };

  it("shows the modal for an eligible guest with no prior state", () => {
    expect(shouldShowSubscribeModal(baseParams)).toBe(true);
  });

  it("hides the modal on an excluded route", () => {
    expect(
      shouldShowSubscribeModal({ ...baseParams, isExcludedRoute: true })
    ).toBe(false);
  });

  it("hides the modal while the subscription-status query is loading", () => {
    expect(
      shouldShowSubscribeModal({
        ...baseParams,
        isLoggedIn: true,
        isSubscribed: undefined,
      })
    ).toBe(false);
  });

  it("hides the modal for an already-subscribed logged-in user", () => {
    expect(
      shouldShowSubscribeModal({
        ...baseParams,
        isLoggedIn: true,
        isSubscribed: true,
      })
    ).toBe(false);
  });

  it("shows the modal for a not-yet-subscribed logged-in user", () => {
    expect(
      shouldShowSubscribeModal({
        ...baseParams,
        isLoggedIn: true,
        isSubscribed: false,
      })
    ).toBe(true);
  });

  it("hides the modal for a guest who already submitted the guest form", () => {
    expect(
      shouldShowSubscribeModal({ ...baseParams, guestAlreadySubscribed: true })
    ).toBe(false);
  });

  it("hides the modal inside the 24h cooldown", () => {
    expect(
      shouldShowSubscribeModal({ ...baseParams, lastShownAt: hoursAgo(1) })
    ).toBe(false);
  });

  it("hides the modal at just under the 24h cooldown boundary", () => {
    const justUnder = new Date(hoursAgo(24).getTime() + 1);
    expect(
      shouldShowSubscribeModal({ ...baseParams, lastShownAt: justUnder })
    ).toBe(false);
  });

  it("shows the modal at exactly the 24h cooldown boundary", () => {
    expect(
      shouldShowSubscribeModal({ ...baseParams, lastShownAt: hoursAgo(24) })
    ).toBe(true);
  });

  it("shows the modal past the 24h cooldown boundary", () => {
    expect(
      shouldShowSubscribeModal({ ...baseParams, lastShownAt: hoursAgo(25) })
    ).toBe(true);
  });
});
