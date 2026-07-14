"use client";

import { Button } from "../button"
import CommentIcon from "./comment-icon";
import { useRouter, useSearchParams } from "next/navigation";

interface CommentButtonProps {
  commentCount: number;
}

export function CommentButton(props: CommentButtonProps) {
  const { commentCount } = props;
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleClick = () => {
    // Add focus parameter to trigger textarea focus
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("focus", "comment");
    const queryString = newSearchParams.toString();
    
    // Scroll to comments section using hash
    router.push(`#comments${queryString ? `?${queryString}` : ""}`, { scroll: false });
    
    // Then scroll smoothly to the element
    setTimeout(() => {
      const commentsSection = document.getElementById("comments");
      if (commentsSection) {
        commentsSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 0);
  };

  return (
    <Button 
      variant="ghost" 
      className="h-auto min-h-10 !px-4 !py-2 rounded-[4px] cursor-pointer bg-transparent border border-rule text-ink-muted hover:!border-primary-700 hover:text-primary-800 flex items-center gap-2" 
      aria-label="Comment on post"
      onClick={handleClick}
    >
      <CommentIcon size={20} />
      {commentCount > 0 && (
        <span className="text-sm">
          {commentCount}
        </span>
      )}
    </Button>
  );
}