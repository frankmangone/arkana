import type { QueryClient } from "@tanstack/react-query";
import { toggleLike, toggleRead } from "@/lib/api/services/posts";
import { PendingActionType, type PendingActionPayloadMap } from "./pending-action-types";

export function createPendingActionRegistry(queryClient: QueryClient) {
  return {
    [PendingActionType.Like]: async (
      payload: PendingActionPayloadMap[typeof PendingActionType.Like]
    ): Promise<void> => {
      await toggleLike(payload.path);
      queryClient.invalidateQueries({ queryKey: ["postInfo", payload.path] });
    },
    [PendingActionType.MarkAsRead]: async (
      payload: PendingActionPayloadMap[typeof PendingActionType.MarkAsRead]
    ): Promise<void> => {
      await toggleRead(payload.path);
      queryClient.invalidateQueries({ queryKey: ["postInfo", payload.path] });
      queryClient.invalidateQueries({ queryKey: ["readStatuses"] });
    },
  } satisfies {
    [K in PendingActionType]: (payload: PendingActionPayloadMap[K]) => Promise<void>;
  };
}
