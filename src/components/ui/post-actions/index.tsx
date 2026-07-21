"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";
import {
  useLike,
  useToggleRead,
  usePostInfo,
  useComments,
} from "@/lib/api/hooks/usePosts";
import { useParams, useRouter } from "next/navigation";
import { useDictionary } from "@/lib/hooks/use-dictionary";
import { LikeButton } from "./like-button";
import { ReadButton } from "./read-button";
import { CommentButton } from "./comment-button";

interface PostActionsProps {
  className?: string;
  /** The post path identifier (e.g., "blog/my-post-slug") */
  path: string;
}

export function PostActions({ className = "gap-2", path }: PostActionsProps) {
  const params = useParams();
  const router = useRouter();
  const lang = (params?.lang as string) || "en";

  const { user } = useAuth();
  const dictionary = useDictionary(lang);
  const likeMutation = useLike();
  const readMutation = useToggleRead();

  const { data: postInfo } = usePostInfo({
    path,
    userId: user?.id,
  });

  const { data: commentsData } = useComments({ path });

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [read, setRead] = useState(false);

  useEffect(() => {
    if (postInfo) {
      setLiked(postInfo.liked);
      setLikeCount(postInfo.like_count);
      setRead(postInfo.read);
    }
  }, [postInfo]);

  const handleLike = async () => {
    if (!user) {
      router.push(`/${lang}/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    try {
      const response = await likeMutation.mutateAsync({ path, liked });
      setLiked(response.liked);
      setLikeCount(response.like_count);
    } catch {
      // Signature rejected or request failed
    }
  };

  const handleRead = async () => {
    if (!user) {
      router.push(`/${lang}/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    try {
      const response = await readMutation.mutateAsync({ path, read });
      setRead(response.read);
      toast.success(
        response.read
          ? dictionary?.blog.markedAsRead || "Marked as read"
          : dictionary?.blog.markedAsUnread || "Marked as unread"
      );
    } catch {
      toast.error(dictionary?.blog.error || "Error");
    }
  };

  const likeButtonProps = {
    liked,
    likeCount,
    handleLike,
    likeMutation,
  };

  const readButtonProps = {
    read,
    handleRead,
    readMutation,
  };

  const commentCount = commentsData?.comments?.length || 0;

  return (
    <div className={`flex items-center ${className}`}>
      <LikeButton {...likeButtonProps} />
      <CommentButton commentCount={commentCount} />
      <ReadButton {...readButtonProps} />
    </div>
  );
}
