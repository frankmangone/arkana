import type { QueryClient } from "@tanstack/react-query";
import { toggleLike } from "@/lib/api/services/posts";
import { PendingActionType, type PendingActionPayloadMap } from "./pending-action-types";

export function createPendingActionRegistry(queryClient: QueryClient) {
  return {
    [PendingActionType.Like]: async (
      payload: PendingActionPayloadMap[typeof PendingActionType.Like]
    ): Promise<void> => {
      await toggleLike(payload.path);
      queryClient.invalidateQueries({ queryKey: ["postInfo", payload.path] });
    },
  } satisfies {
    [K in PendingActionType]: (payload: PendingActionPayloadMap[K]) => Promise<void>;
  };
}
