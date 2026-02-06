import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getPostInfo,
  toggleLike,
  walletLogin,
  PostInfoResponse,
  ToggleLikeResponse,
  WalletLoginResponse,
} from "../services/posts";
import { createSignedJWS } from "@/lib/wallet/jws";
import { API_ACTIONS } from "../actions";

interface UsePostInfoParams {
  path: string;
  walletAddress?: string;
}

/**
 * Hook to fetch post info (like count and liked status).
 */
export function usePostInfo({ path, walletAddress }: UsePostInfoParams) {
  return useQuery<PostInfoResponse, Error>({
    queryKey: ["postInfo", path, walletAddress],
    queryFn: () => getPostInfo(path, walletAddress),
    enabled: !!path,
  });
}

interface UseWalletLoginParams {
  address: string;
}

/**
 * Hook to login/register a wallet with the backend.
 * Call this after connecting a wallet to ensure it's registered.
 */
export function useWalletLogin() {
  return useMutation<WalletLoginResponse, Error, UseWalletLoginParams>({
    mutationFn: async ({ address }) => {
      const jws = await createSignedJWS(address, { action: API_ACTIONS.LOGIN });
      return walletLogin(jws);
    },
  });
}

export interface UseLikeParams {
  address: string;
  path: string;
  liked: boolean;
}

/**
 * Hook to toggle like on a post with wallet signature authentication.
 * Note: The wallet must be registered first (call useWalletLogin after connecting).
 */
export function useLike() {
  return useMutation<ToggleLikeResponse, Error, UseLikeParams>({
    mutationFn: async ({ address, path, liked }) => {
      // Use UNLIKE_POST if currently liked, LIKE_POST if not
      const action = liked ? API_ACTIONS.UNLIKE_POST : API_ACTIONS.LIKE_POST;
      const jws = await createSignedJWS(address, { action, path });
      return toggleLike(path, jws);
    },
  });
}
