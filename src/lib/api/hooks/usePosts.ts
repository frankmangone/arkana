import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getPostInfo,
  toggleLike,
  toggleRead,
  getReadStatuses,
  getComments,
  createComment,
  PostInfoResponse,
  ToggleLikeResponse,
  ToggleReadResponse,
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

export interface UseToggleReadParams {
  path: string;
  read: boolean;
}

/**
 * Hook to toggle read status on a post. Authentication via Bearer token (auto-added by axios).
 */
export function useToggleRead() {
  return useMutation<ToggleReadResponse, Error, UseToggleReadParams>({
    mutationFn: async ({ path }) => {
      return toggleRead(path);
    },
    onSuccess: (response, variables) => {
      const event = response.read ? EVENTS.POST_READ : EVENTS.POST_UNREAD;
      trackEvent(event, { path: variables.path });
    },
  });
}

interface UseReadStatusesParams {
  paths: string[];
  /** Set to false for guests — skips the fetch entirely. Defaults to true. */
  enabled?: boolean;
}

/**
 * Hook to fetch read status for many posts in one request (e.g. an entire
 * reading list's stepper). Requires auth — callers should pass `enabled: !!user`.
 */
export function useReadStatuses({ paths, enabled = true }: UseReadStatusesParams) {
  return useQuery<Record<string, boolean>, Error>({
    queryKey: ["readStatuses", paths],
    queryFn: () => getReadStatuses(paths),
    enabled: enabled && paths.length > 0,
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
