"use client";

import { Button } from "../button";
import { MessageCircle } from "lucide-react";
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
    router.push(`#comments${queryString ? `?${queryString}` : ""}`, {
      scroll: false,
    });

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
      className="h-auto !px-2.5 !py-2 rounded-[4px] cursor-pointer bg-transparent text-white/70 hover:bg-black/10 hover:text-white flex items-center gap-1.5"
      aria-label="Comment on post"
      onClick={handleClick}
    >
      <MessageCircle className="!size-5" strokeWidth={2} />
      {commentCount > 0 && <span className="text-sm">{commentCount}</span>}
    </Button>
  );
}
