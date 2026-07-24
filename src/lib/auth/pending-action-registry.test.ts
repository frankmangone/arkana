import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient } from "@tanstack/react-query";

const mockToggleLike = vi.fn();
vi.mock("@/lib/api/services/posts", () => ({
  toggleLike: (path: string) => mockToggleLike(path),
}));

import { createPendingActionRegistry } from "./pending-action-registry";
import { PendingActionType } from "./pending-action-types";

describe("createPendingActionRegistry", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
    mockToggleLike.mockReset();
    mockToggleLike.mockResolvedValue({ liked: true, like_count: 1 });
  });

  it("like handler calls toggleLike with the payload path", async () => {
    const registry = createPendingActionRegistry(queryClient);
    await registry[PendingActionType.Like]({ path: "blog/my-post" });
    expect(mockToggleLike).toHaveBeenCalledWith("blog/my-post");
  });

  it("like handler invalidates the postInfo query for that path", async () => {
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const registry = createPendingActionRegistry(queryClient);
    await registry[PendingActionType.Like]({ path: "blog/my-post" });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["postInfo", "blog/my-post"],
    });
  });
});
