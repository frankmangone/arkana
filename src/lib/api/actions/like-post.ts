import { API_ACTIONS } from "./actions";

/**
 * Like post action payload.
 * Used to like a post.
 */
export interface LikePostPayload {
  action: typeof API_ACTIONS.LIKE_POST;
  path: string;
}
