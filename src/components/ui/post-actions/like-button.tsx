import { Button } from "../button"
import { UseMutationResult } from "@tanstack/react-query";
import { ToggleLikeResponse } from "@/lib/api/services/posts";
import { UseLikeParams } from "@/lib/api";
import LikeIcon from "./like-icon";

interface LikeButtonProps {
  liked: boolean;
  likeCount: number;
  handleLike: () => void;
  likeMutation: UseMutationResult<ToggleLikeResponse, Error, UseLikeParams>;
}

export function LikeButton(props: LikeButtonProps) {
  const { liked, likeCount, handleLike, likeMutation } = props;
  
  return (
    <>
        <Button
            variant="ghost"
            className="h-auto min-h-10 !px-4 !py-2 rounded-[4px] cursor-pointer bg-transparent border border-rule text-ink-muted hover:!border-primary-700 hover:text-primary-800 flex items-center gap-2"
            aria-label={liked ? "Unlike post" : "Like post"}
            onClick={handleLike}
            disabled={likeMutation.isPending}
        >
            <LikeIcon size={20} filled={liked} />
            {likeCount > 0 && (
                <span className="text-sm">
                {likeCount}
                </span>
            )}
        </Button>
      </>
  );
}