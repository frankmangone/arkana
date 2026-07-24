import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const mockUseParams = vi.fn();
const mockUsePathname = vi.fn();
vi.mock("next/navigation", () => ({
  useParams: () => mockUseParams(),
  usePathname: () => mockUsePathname(),
}));

const mockUseAuth = vi.fn();
vi.mock("@/components/providers/auth-provider", () => ({
  useAuth: () => mockUseAuth(),
}));

import { AuthButton } from "./auth-button";

const STORAGE_KEY = "arkana_pending_intent";

describe("AuthButton — logged out", () => {
  beforeEach(() => {
    sessionStorage.clear();
    mockUseParams.mockReturnValue({ lang: "en" });
    mockUsePathname.mockReturnValue("/en/blog/my-post");
    mockUseAuth.mockReturnValue({ user: null, loading: false, logout: vi.fn() });
  });

  it("stores a pending intent with the current path when Sign in is clicked", () => {
    render(<AuthButton />);
    fireEvent.click(screen.getByText("Sign in"));
    const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) as string);
    expect(stored.returnTo).toBe("/en/blog/my-post");
    expect(stored.action).toBeUndefined();
  });
});
