import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getPostInfo,
  toggleLike,
  walletLogin,
  getComments,
  createComment,
  PostInfoResponse,
  ToggleLikeResponse,
  WalletLoginResponse,
  CommentsResponse,
  CommentResponse,
} from "../services/posts";
import { createSignedJWS } from "@/lib/wallet/jws";
import { API_ACTIONS } from "../actions";
import { trackEvent, EVENTS } from "@/lib/analytics";

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
    onSuccess: (response, variables) => {
      const event = response.liked ? EVENTS.POST_LIKED : EVENTS.POST_UNLIKED;
      trackEvent(event, { path: variables.path });
    },
  });
}

// ============ Comments ============

interface UseCommentsParams {
  path: string;
}

/**
 * Hook to fetch comments for a post.
 */
export function useComments({ path }: UseCommentsParams) {
  return useQuery<CommentsResponse, Error>({
    queryKey: ["comments", path],
    queryFn: () => getComments(path),
    enabled: !!path,
  });
}

export interface UseCreateCommentParams {
  address: string;
  path: string;
  body: string;
  parentId?: number;
}

/**
 * Hook to create a comment on a post with wallet signature authentication.
 */
export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation<CommentResponse, Error, UseCreateCommentParams>({
    mutationFn: async ({ address, path, body, parentId }) => {
      const jws = await createSignedJWS(address, {
        action: API_ACTIONS.CREATE_COMMENT,
        path,
        body,
        parent_id: parentId,
      });
      return createComment(path, jws);
    },
    onSuccess: (_, variables) => {
      trackEvent(EVENTS.COMMENT_CREATED, {
        path: variables.path,
        is_reply: !!variables.parentId,
      });
      // Invalidate comments query to refetch
      queryClient.invalidateQueries({ queryKey: ["comments", variables.path] });
    },
  });
}
