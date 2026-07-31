import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockUseParams = vi.fn();
const mockUseRouter = vi.fn();
vi.mock("next/navigation", () => ({
  useParams: () => mockUseParams(),
  useRouter: () => mockUseRouter(),
  usePathname: () => "/en/blog/my-post",
  useSearchParams: () => new URLSearchParams(),
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
  useLike: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useToggleRead: () => ({ mutateAsync: vi.fn(), isPending: false }),
  usePostInfo: () => ({ data: undefined }),
  useComments: () => ({ data: undefined }),
}));

vi.mock("@/lib/hooks/use-dictionary", () => ({
  useDictionary: () => undefined,
}));

import { PostActions } from "./index";
import { PendingActionType } from "@/lib/auth/pending-action-types";

describe("PostActions - logged out", () => {
  beforeEach(() => {
    mockUseParams.mockReturnValue({ lang: "en" });
    mockUseRouter.mockReturnValue({ push: vi.fn() });
    mockUseAuth.mockReturnValue({ user: null });
    mockRequireAuth.mockReset();
  });

  function renderPostActions() {
    const queryClient = new QueryClient();
    return render(
      <QueryClientProvider client={queryClient}>
        <PostActions path="blog/my-post" />
      </QueryClientProvider>
    );
  }

  it("requires auth with a like action when Like is clicked while logged out", () => {
    renderPostActions();
    fireEvent.click(screen.getByLabelText("Like post"));
    expect(mockRequireAuth).toHaveBeenCalledWith({
      type: PendingActionType.Like,
      payload: { path: "blog/my-post" },
    });
  });

  it("requires auth with no action when the read toggle is clicked while logged out", () => {
    renderPostActions();
    fireEvent.click(screen.getByLabelText("Mark post as read"));
    expect(mockRequireAuth).toHaveBeenCalledWith();
  });
});
