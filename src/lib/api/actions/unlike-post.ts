import { API_ACTIONS } from "./actions";

/**
 * Unlike post action payload.
 * Used to unlike a post.
 */
export interface UnlikePostPayload {
  action: typeof API_ACTIONS.UNLIKE_POST;
  path: string;
}
