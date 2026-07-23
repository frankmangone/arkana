import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";

const mockUsePathname = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

const mockUseAuth = vi.fn();
vi.mock("@/components/providers/auth-provider", () => ({
  useAuth: () => mockUseAuth(),
}));

const mockUseSubscriptionStatus = vi.fn();
vi.mock("@/lib/api/hooks/useSubscriptions", () => ({
  useSubscriptionStatus: (enabled: boolean) =>
    mockUseSubscriptionStatus(enabled),
}));

import { useSubscribeModalEligibility } from "./use-subscribe-modal-eligibility";

const LAST_SHOWN_KEY = "subscribe_modal_last_shown";
const GUEST_SUBSCRIBED_KEY = "subscribe_modal_guest_subscribed";

describe("useSubscribeModalEligibility", () => {
  beforeEach(() => {
    localStorage.clear();
    mockUsePathname.mockReturnValue("/");
    mockUseAuth.mockReturnValue({ user: null, loading: false, logout: vi.fn() });
    mockUseSubscriptionStatus.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("is eligible for a fresh guest on a non-excluded route", () => {
    const { result } = renderHook(() => useSubscribeModalEligibility());
    expect(result.current.isEligible).toBe(true);
    expect(result.current.isLoggedIn).toBe(false);
  });

  it("is not eligible on an excluded route", () => {
    mockUsePathname.mockReturnValue("/en/login");
    const { result } = renderHook(() => useSubscribeModalEligibility());
    expect(result.current.isEligible).toBe(false);
  });

  it("is not eligible while the subscription status query is loading", () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1 },
      loading: false,
      logout: vi.fn(),
    });
    mockUseSubscriptionStatus.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });
    const { result } = renderHook(() => useSubscribeModalEligibility());
    expect(result.current.isEligible).toBe(false);
    expect(result.current.isLoggedIn).toBe(true);
  });

  it("is not eligible when the status query errored (fails closed)", () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1 },
      loading: false,
      logout: vi.fn(),
    });
    mockUseSubscriptionStatus.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });
    const { result } = renderHook(() => useSubscribeModalEligibility());
    expect(result.current.isEligible).toBe(false);
  });

  it("is not eligible for a guest who already subscribed locally", () => {
    localStorage.setItem(GUEST_SUBSCRIBED_KEY, "true");
    const { result } = renderHook(() => useSubscribeModalEligibility());
    expect(result.current.isEligible).toBe(false);
  });

  it("is not eligible within the 24h cooldown", () => {
    localStorage.setItem(LAST_SHOWN_KEY, new Date().toISOString());
    const { result } = renderHook(() => useSubscribeModalEligibility());
    expect(result.current.isEligible).toBe(false);
  });

  it("markShown writes an ISO timestamp to localStorage", () => {
    const { result } = renderHook(() => useSubscribeModalEligibility());
    result.current.markShown();
    const stored = localStorage.getItem(LAST_SHOWN_KEY);
    expect(stored).not.toBeNull();
    expect(new Date(stored as string).toString()).not.toBe("Invalid Date");
  });

  it("markGuestSubscribed writes the guest-suppression flag", () => {
    const { result } = renderHook(() => useSubscribeModalEligibility());
    result.current.markGuestSubscribed();
    expect(localStorage.getItem(GUEST_SUBSCRIBED_KEY)).toBe("true");
  });
});
