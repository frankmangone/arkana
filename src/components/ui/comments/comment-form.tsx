"use client";

import { useEffect, useState, useRef } from "react";
import { useCreateComment } from "@/lib/api/hooks/usePosts";
import { Button } from "../button";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { useDictionary } from "@/lib/hooks/use-dictionary";

const MAX_COMMENT_LENGTH = 1000;

interface CommentFormProps {
  path: string;
  parentId?: number;
  onSuccess?: () => void;
  compact?: boolean;
  autoFocus?: boolean;
}

export function CommentForm({
  path,
  parentId,
  onSuccess,
  compact = false,
  autoFocus = false,
}: CommentFormProps) {
  const [body, setBody] = useState("");
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const dictionary = useDictionary(lang);
  const createComment = useCreateComment();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [autoFocus]);

  const charactersRemaining = MAX_COMMENT_LENGTH - body.length;
  const isOverLimit = charactersRemaining < 0;
  const isEmpty = body.trim().length === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEmpty || isOverLimit) return;

    try {
      await createComment.mutateAsync({
        path,
        body: body.trim(),
        parentId,
      });
      setBody("");
      onSuccess?.();
      toast.success(
        dictionary?.comments?.form?.commentPosted || "Comment posted!"
      );
    } catch {
      toast.error(
        dictionary?.comments?.form?.failedToPost || "Failed to post comment"
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className={compact ? "" : "mb-8"}>
      <textarea
        ref={textareaRef}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={
          parentId
            ? dictionary?.comments?.form?.writeReply || "Write a reply..."
            : dictionary?.comments?.form?.writeComment || "Write a comment..."
        }
        className={`w-full p-3 border border-rule-strong rounded-[4px] bg-transparent text-ink-body placeholder:text-ink-faint focus:outline-none focus:border-primary-700 resize-none transition-colors ${
          compact ? "text-sm min-h-[80px]" : "min-h-[120px]"
        }`}
        disabled={createComment.isPending}
      />

      <div className="flex items-center justify-between mt-2">
        <span
          className={`text-xs ${
            isOverLimit
              ? "text-salmon-850"
              : charactersRemaining < 200
              ? "text-bronze-850"
              : "text-sky-850"
          }`}
        >
          {charactersRemaining}{" "}
          {dictionary?.comments?.form?.charactersRemaining ||
            "characters remaining"}
        </span>

        <Button
          type="submit"
          disabled={isEmpty || isOverLimit || createComment.isPending}
          className={compact ? "text-sm text-white px-3 py-1" : "text-white"}
        >
          {createComment.isPending
            ? dictionary?.comments?.form?.posting || "Posting..."
            : parentId
            ? dictionary?.comments?.form?.reply || "Reply"
            : dictionary?.comments?.form?.postComment || "Post Comment"}
        </Button>
      </div>
    </form>
  );
}
