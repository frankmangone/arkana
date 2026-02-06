"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@/components/providers/wallet-provider";
import { useLike, usePostInfo } from "@/lib/api/hooks/usePosts";
import { useParams, useRouter } from "next/navigation";
import { LikeButton } from "./like-button";
import { BookmarkButton } from "./bookmark-button";

interface PostActionsProps {
  className?: string;
  /** The post path identifier (e.g., "blog/my-post-slug") */
  path: string;
}

export function PostActions({ className, path }: PostActionsProps) {
  const params = useParams();
  const router = useRouter();
  const lang = (params?.lang as string) || "en";

  const { wallet } = useWallet();
  const likeMutation = useLike();

  const { data: postInfo } = usePostInfo({
    path,
    walletAddress: wallet?.address,
  });

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // Sync local state with fetched data
  useEffect(() => {
    if (postInfo) {
      setLiked(postInfo.liked);
      setLikeCount(postInfo.like_count);
    }
  }, [postInfo]);

  const handleLike = async () => {
    if (!wallet?.address) {
      // Redirect to login, then back to this page
      router.push(`/${lang}/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    try {
      const response = await likeMutation.mutateAsync({
        address: wallet.address,
        path,
        liked,
      });
      setLiked(response.liked);
      setLikeCount(response.like_count);
    } catch {
      // Signature rejected or request failed - no action needed
    }
  };

  const likeButtonProps = {
    liked,
    likeCount,
    handleLike,
    likeMutation,
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <LikeButton {...likeButtonProps} />
      {false && <BookmarkButton />}
    </div>
  );
}
