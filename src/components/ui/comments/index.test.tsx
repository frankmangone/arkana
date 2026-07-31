import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const mockUseParams = vi.fn();
const mockUseSearchParams = vi.fn();
const mockUseRouter = vi.fn();
vi.mock("next/navigation", () => ({
  useParams: () => mockUseParams(),
  useRouter: () => mockUseRouter(),
  useSearchParams: () => mockUseSearchParams(),
}));

const mockUseAuth = vi.fn();
vi.mock("@/components/providers/auth-provider", () => ({
  useAuth: () => mockUseAuth(),
}));

const mockRequireAuth = vi.fn();
vi.mock("@/lib/auth/use-require-auth", () => ({
  useRequireAuth: () => mockRequireAuth,
}));

vi.mock("@/lib/api/hooks/usePosts", () => ({
  useComments: () => ({ data: { comments: [] }, isLoading: false, error: null }),
}));

vi.mock("@/lib/hooks/use-dictionary", () => ({
  useDictionary: () => undefined,
}));

import { CommentSection } from "./index";

describe("CommentSection - logged out", () => {
  beforeEach(() => {
    mockUseParams.mockReturnValue({ lang: "en" });
    mockUseRouter.mockReturnValue({ push: vi.fn(), replace: vi.fn() });
    mockUseSearchParams.mockReturnValue(new URLSearchParams());
    mockUseAuth.mockReturnValue({ user: null });
    mockRequireAuth.mockReset();
  });

  it("requires auth with no action when Sign in is clicked", () => {
    render(<CommentSection path="blog/my-post" />);
    fireEvent.click(screen.getByText("Sign in"));
    expect(mockRequireAuth).toHaveBeenCalledWith();
  });
});
