import apiClient from "../client";

export interface WalletInfo {
  id: number;
  address: string;
  system: string;
  created_at: string;
  updated_at: string;
}

export interface WalletLoginResponse {
  wallet: WalletInfo;
}

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
 * Login/register a wallet with the backend.
 * This creates the wallet record if it doesn't exist.
 *
 * @param jws - The signed JWS (payload can be empty or have any fields)
 * @returns The wallet info
 */
export async function walletLogin(jws: string): Promise<WalletLoginResponse> {
  const response = await apiClient.post<WalletLoginResponse>("/api/login", jws, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
  return response.data;
}

/**
 * Get post info including like count and whether the user has liked it.
 *
 * @param path - The post path identifier
 * @param walletAddress - Optional wallet address to check if user has liked
 * @returns The post info
 */
export async function getPostInfo(
  path: string,
  walletAddress?: string
): Promise<PostInfoResponse> {
  const params = new URLSearchParams();
  if (walletAddress) {
    params.set("wallet", walletAddress);
  }
  const queryString = params.toString();
  const url = `/api/posts/${path}/info${queryString ? `?${queryString}` : ""}`;
  const response = await apiClient.get<PostInfoResponse>(url);
  return response.data;
}

/**
 * Toggle like on a post using JWS authentication.
 * The backend expects the raw JWS string as the request body.
 *
 * @param path - The post path identifier (used in URL)
 * @param jws - The signed JWS for authentication
 * @returns The like response with liked status and count
 */
export async function toggleLike(path: string, jws: string): Promise<ToggleLikeResponse> {
  const response = await apiClient.post<ToggleLikeResponse>(
    `/api/posts/${path}/like`,
    jws,
    {
      headers: {
        "Content-Type": "text/plain",
      },
    }
  );
  return response.data;
}

// ============ Comments ============

export interface CommentResponse {
  id: number;
  parent_id: number | null;
  body: string;
  created_at: string;
  author_address: string;
}

export interface CommentsResponse {
  comments: CommentResponse[];
  total: number;
}

/**
 * Get all comments for a post.
 *
 * @param path - The post path identifier
 * @returns The comments response with list and total count
 */
export async function getComments(path: string): Promise<CommentsResponse> {
  const response = await apiClient.get<CommentsResponse>(`/api/posts/${path}/comments`);
  return response.data;
}

/**
 * Create a comment on a post using JWS authentication.
 *
 * @param path - The post path identifier
 * @param jws - The signed JWS containing the comment body
 * @returns The created comment
 */
export async function createComment(path: string, jws: string): Promise<CommentResponse> {
  const response = await apiClient.post<CommentResponse>(
    `/api/posts/${path}/comments`,
    jws,
    {
      headers: {
        "Content-Type": "text/plain",
      },
    }
  );
  return response.data;
}
