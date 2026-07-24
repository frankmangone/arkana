import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";

const mockPush = vi.fn();
const mockUsePathname = vi.fn();
const mockUseParams = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
  useParams: () => mockUseParams(),
  useRouter: () => ({ push: mockPush }),
}));

import { useRequireAuth } from "./use-require-auth";
import { PendingActionType } from "./pending-action-types";

const STORAGE_KEY = "arkana_pending_intent";

describe("useRequireAuth", () => {
  beforeEach(() => {
    sessionStorage.clear();
    mockPush.mockReset();
    mockUsePathname.mockReturnValue("/en/blog/my-post");
    mockUseParams.mockReturnValue({ lang: "en" });
  });

  it("stores an intent with no action and navigates to the localized login page", () => {
    const { result } = renderHook(() => useRequireAuth());
    result.current();
    const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) as string);
    expect(stored.returnTo).toBe("/en/blog/my-post");
    expect(stored.action).toBeUndefined();
    expect(mockPush).toHaveBeenCalledWith("/en/login");
  });

  it("stores an intent with the given action", () => {
    const { result } = renderHook(() => useRequireAuth());
    result.current({
      type: PendingActionType.Like,
      payload: { path: "blog/my-post" },
    });
    const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) as string);
    expect(stored.action).toEqual({
      type: PendingActionType.Like,
      payload: { path: "blog/my-post" },
    });
  });

  it("falls back to lang 'en' when no lang param is present", () => {
    mockUseParams.mockReturnValue({});
    const { result } = renderHook(() => useRequireAuth());
    result.current();
    expect(mockPush).toHaveBeenCalledWith("/en/login");
  });
});
