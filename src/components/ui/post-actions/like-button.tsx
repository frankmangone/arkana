import { Button } from "../button";
import { UseMutationResult } from "@tanstack/react-query";
import { ToggleLikeResponse } from "@/lib/api/services/posts";
import { UseLikeParams } from "@/lib/api";
import { Heart } from "lucide-react";

interface LikeButtonProps {
  liked: boolean;
  likeCount: number;
  handleLike: () => void;
  likeMutation: UseMutationResult<ToggleLikeResponse, Error, UseLikeParams>;
}

export function LikeButton(props: LikeButtonProps) {
  const { liked, likeCount, handleLike, likeMutation } = props;

  return (
    <Button
      variant="ghost"
      className={`h-auto !px-2.5 !py-2 rounded-[4px] cursor-pointer bg-transparent hover:bg-black/10 flex items-center gap-1.5 ${
        liked ? "text-salmon-500 hover:text-salmon-500" : "text-white/70 hover:text-white"
      }`}
      aria-label={liked ? "Unlike post" : "Like post"}
      title={liked ? "Unlike post" : "Like post"}
      onClick={handleLike}
      disabled={likeMutation.isPending}
    >
      <Heart
        className="!size-5"
        fill={liked ? "currentColor" : "none"}
        strokeWidth={2}
      />
      {likeCount > 0 && <span className="text-sm">{likeCount}</span>}
    </Button>
  );
}
