"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Bookmark } from "lucide-react";
import { useWallet } from "@/components/providers/wallet-provider";
import { useLike, usePostInfo } from "@/lib/api/hooks/usePosts";
import { useParams, useRouter } from "next/navigation";

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
      });
      setLiked(response.liked);
      setLikeCount(response.like_count);
    } catch {
      // Signature rejected or request failed - no action needed
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-none cursor-pointer hover:text-primary-500 dark:text-gray-300 dark:hover:text-primary-500"
        aria-label={liked ? "Unlike post" : "Like post"}
        onClick={handleLike}
        disabled={likeMutation.isPending}
      >
        <Heart
          className={`h-6 w-6 ${liked ? "fill-red-500 text-red-500" : ""}`}
        />
      </Button>
      {likeCount > 0 && (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {likeCount}
        </span>
      )}

      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-none cursor-pointer hover:text-primary-500 dark:text-gray-300 dark:hover:text-primary-500"
        aria-label="Bookmark post"
      >
        <Bookmark className="h-6 w-6" />
      </Button>
    </div>
  );
}
