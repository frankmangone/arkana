import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

const mockToggleLike = vi.fn();
vi.mock("../services/posts", () => ({
  toggleLike: (path: string) => mockToggleLike(path),
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: vi.fn(),
  EVENTS: { POST_LIKED: "post_liked", POST_UNLIKED: "post_unliked" },
}));

import { useLike } from "./usePosts";

describe("useLike", () => {
  let queryClient: QueryClient;

  function wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  beforeEach(() => {
    queryClient = new QueryClient();
    mockToggleLike.mockReset();
    mockToggleLike.mockResolvedValue({ liked: true, like_count: 1 });
  });

  it("invalidates the postInfo query for that path on success", async () => {
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useLike(), { wrapper });

    result.current.mutate({ path: "blog/my-post", liked: false });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["postInfo", "blog/my-post"],
    });
  });
});
