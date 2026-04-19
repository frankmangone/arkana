import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getPostInfo,
  toggleLike,
  getComments,
  createComment,
  PostInfoResponse,
  ToggleLikeResponse,
  CommentsResponse,
  CommentResponse,
} from "../services/posts";
import { trackEvent, EVENTS } from "@/lib/analytics";

interface UsePostInfoParams {
  path: string;
  userId?: number;
}

/**
 * Hook to fetch post info (like count and liked status).
 */
export function usePostInfo({ path, userId }: UsePostInfoParams) {
  return useQuery<PostInfoResponse, Error>({
    queryKey: ["postInfo", path, userId],
    queryFn: () => getPostInfo(path, userId),
    enabled: !!path,
  });
}

export interface UseLikeParams {
  path: string;
  liked: boolean;
}

/**
 * Hook to toggle like on a post. Authentication via Bearer token (auto-added by axios).
 */
export function useLike() {
  return useMutation<ToggleLikeResponse, Error, UseLikeParams>({
    mutationFn: async ({ path }) => {
      return toggleLike(path);
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
  path: string;
  body: string;
  parentId?: number;
}

/**
 * Hook to create a comment. Authentication via Bearer token (auto-added by axios).
 */
export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation<CommentResponse, Error, UseCreateCommentParams>({
    mutationFn: async ({ path, body, parentId }) => {
      return createComment(path, body, parentId);
    },
    onSuccess: (_, variables) => {
      trackEvent(EVENTS.COMMENT_CREATED, {
        path: variables.path,
        is_reply: !!variables.parentId,
      });
      queryClient.invalidateQueries({ queryKey: ["comments", variables.path] });
    },
  });
}
