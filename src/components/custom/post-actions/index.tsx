"use client";

import { Button } from "@/components/ui/button";
import { Heart, Bookmark } from "lucide-react";

interface PostActionsProps {
  className?: string;
}

export function PostActions({ className }: PostActionsProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-none cursor-pointer hover:text-primary-500 dark:text-gray-300 dark:hover:text-primary-500"
        aria-label="Like post"
      >
        <Heart className="h-6 w-6" />
      </Button>

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
