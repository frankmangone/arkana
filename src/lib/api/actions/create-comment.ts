import { API_ACTIONS } from "./actions";

/**
 * Create comment action payload.
 * Used to create a comment on a post.
 */
export interface CreateCommentPayload {
  action: typeof API_ACTIONS.CREATE_COMMENT;
  path: string;
  body: string;
  parent_id?: number;
}
