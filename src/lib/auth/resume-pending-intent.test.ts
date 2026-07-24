import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const mockLikeHandler = vi.fn();
vi.mock("./pending-action-registry", () => ({
  createPendingActionRegistry: () => ({ like: mockLikeHandler }),
}));

import { setPendingIntent, resumePendingIntent } from "./pending-intent";
import { PendingActionType } from "./pending-action-types";

const NOW = new Date("2026-07-24T12:00:00.000Z").getTime();

describe("resumePendingIntent", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    sessionStorage.clear();
    queryClient = new QueryClient();
    mockLikeHandler.mockReset().mockResolvedValue(undefined);
    vi.mocked(toast.error).mockReset();
  });

  it("returns the fallback when no intent is stored", async () => {
    const result = await resumePendingIntent(queryClient, "/en", NOW);
    expect(result).toBe("/en");
    expect(mockLikeHandler).not.toHaveBeenCalled();
  });

  it("returns the stored returnTo and runs the action handler", async () => {
    setPendingIntent(
      {
        returnTo: "/en/blog/my-post",
        action: { type: PendingActionType.Like, payload: { path: "blog/my-post" } },
      },
      NOW
    );
    const result = await resumePendingIntent(queryClient, "/en", NOW);
    expect(result).toBe("/en/blog/my-post");
    expect(mockLikeHandler).toHaveBeenCalledWith({ path: "blog/my-post" });
  });

  it("returns returnTo and toasts an error when the handler rejects", async () => {
    mockLikeHandler.mockRejectedValue(new Error("network error"));
    setPendingIntent(
      {
        returnTo: "/en/blog/my-post",
        action: { type: PendingActionType.Like, payload: { path: "blog/my-post" } },
      },
      NOW
    );
    const result = await resumePendingIntent(queryClient, "/en", NOW);
    expect(result).toBe("/en/blog/my-post");
    expect(toast.error).toHaveBeenCalledTimes(1);
  });

  it("returns returnTo with no action handler call when the intent has no action", async () => {
    setPendingIntent({ returnTo: "/en/notifications" }, NOW);
    const result = await resumePendingIntent(queryClient, "/en", NOW);
    expect(result).toBe("/en/notifications");
    expect(mockLikeHandler).not.toHaveBeenCalled();
  });
});
