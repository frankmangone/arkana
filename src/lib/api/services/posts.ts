import apiClient from "../client";

export interface PostInfoResponse {
  path: string;
  like_count: number;
  liked: boolean;
}

export interface ToggleLikeResponse {
  liked: boolean;
  like_count: number;
}

/**
 * Get post info including like count and whether the user has liked it.
 *
 * @param path - The post path identifier
 * @param userId - Optional user ID to check if they've liked the post
 */
export async function getPostInfo(
  path: string,
  userId?: number
): Promise<PostInfoResponse> {
  const params = new URLSearchParams();
  if (userId) {
    params.set("user", String(userId));
  }
  const queryString = params.toString();
  const url = `/api/posts/${path}/info${queryString ? `?${queryString}` : ""}`;
  const response = await apiClient.get<PostInfoResponse>(url);
  return response.data;
}

/**
 * Toggle like on a post. Bearer token is sent automatically by the axios interceptor.
 *
 * @param path - The post path identifier
 */
export async function toggleLike(path: string): Promise<ToggleLikeResponse> {
  const response = await apiClient.post<ToggleLikeResponse>(
    `/api/posts/${path}/like`
  );
  return response.data;
}

// ============ Comments ============

export interface CommentResponse {
  id: number;
  parent_id: number | null;
  body: string;
  created_at: string;
  author_username: string;
  author_avatar_url?: string | null;
}

export interface CommentsResponse {
  comments: CommentResponse[];
  total: number;
}

/**
 * Get all comments for a post.
 */
export async function getComments(path: string): Promise<CommentsResponse> {
  const response = await apiClient.get<CommentsResponse>(`/api/posts/${path}/comments`);
  return response.data;
}

/**
 * Create a comment on a post. Bearer token is sent automatically by the axios interceptor.
 */
export async function createComment(
  path: string,
  body: string,
  parentId?: number
): Promise<CommentResponse> {
  const response = await apiClient.post<CommentResponse>(
    `/api/posts/${path}/comments`,
    { body, parent_id: parentId ?? null }
  );
  return response.data;
}
