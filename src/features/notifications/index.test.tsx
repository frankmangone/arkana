import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const mockRequireAuth = vi.fn();
vi.mock("@/lib/auth/use-require-auth", () => ({
  useRequireAuth: () => mockRequireAuth,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const mockUseAuth = vi.fn();
vi.mock("@/components/providers/auth-provider", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("@/lib/api", () => ({
  useNotificationsInfinite: () => ({
    data: undefined,
    isLoading: false,
    hasNextPage: false,
    fetchNextPage: vi.fn(),
  }),
}));

vi.mock("@/hooks/use-infinite-scroll-trigger", () => ({
  useInfiniteScrollTrigger: () => ({ current: null }),
}));

import { NotificationsPage } from "./index";

describe("NotificationsPage - logged out", () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });
    mockRequireAuth.mockReset();
  });

  it("requires auth with no action when Sign in is clicked", () => {
    render(<NotificationsPage lang="en" />);
    fireEvent.click(screen.getByText("Sign in"));
    expect(mockRequireAuth).toHaveBeenCalledWith();
  });
});
