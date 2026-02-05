import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8082";

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
  const response = await axios.post<WalletLoginResponse>(
    `${API_URL}/api/login`,
    jws,
    {
      headers: {
        "Content-Type": "text/plain",
      },
    }
  );
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
  const url = `${API_URL}/api/posts/${path}/info${queryString ? `?${queryString}` : ""}`;
  const response = await axios.get<PostInfoResponse>(url);
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
  const response = await axios.post<ToggleLikeResponse>(
    `${API_URL}/api/posts/${path}/like`,
    jws,
    {
      headers: {
        "Content-Type": "text/plain",
      },
    }
  );
  return response.data;
}
