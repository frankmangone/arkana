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
      const jws = await createSignedJWS(address, {});
      return walletLogin(jws);
    },
  });
}

interface UseLikeParams {
  address: string;
  path: string;
}

/**
 * Hook to toggle like on a post with wallet signature authentication.
 * Note: The wallet must be registered first (call useWalletLogin after connecting).
 */
export function useLike() {
  return useMutation<ToggleLikeResponse, Error, UseLikeParams>({
    mutationFn: async ({ address, path }) => {
      const jws = await createSignedJWS(address, { action: "like", path });
      return toggleLike(path, jws);
    },
  });
}
