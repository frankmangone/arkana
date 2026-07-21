"use client";

import { useState } from "react";
import { CommentForm } from "./comment-form";
import { useAuth } from "@/components/providers/auth-provider";
import { CommentWithReplies } from "./comment-list";
import { useParams } from "next/navigation";
import { LatexText } from "@/components/ui/latex-text";
import { useDictionary } from "@/lib/hooks/use-dictionary";
import { formatTimeAgo } from "@/lib/format-time-ago";

interface CommentProps {
  comment: CommentWithReplies;
  path: string;
  depth: number;
}

function CommentBody({ body }: { body: string }) {
  return (
    <div className="text-ink-body mb-2 text-sm whitespace-pre-wrap break-words">
      <LatexText className="inline">{body}</LatexText>
    </div>
  );
}

const MAX_DEPTH = 3;

export function Comment({ comment, path, depth }: CommentProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const { user } = useAuth();
  const dictionary = useDictionary(lang);

  const canReply = depth < MAX_DEPTH;
  const timeAgo = formatTimeAgo(comment.created_at, dictionary, lang);

  return (
    <div className={depth > 0 ? "ml-6 pl-4 border-l border-rule" : ""}>
      <div className="border-b border-rule pb-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          {comment.author_avatar_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={comment.author_avatar_url}
              alt={comment.author_username}
              className="h-5 w-5 rounded-full"
            />
          )}
          <span className="text-sm font-medium text-ink-heading">
            {comment.author_username}
          </span>
          <span className="text-ink-faint text-sm">&middot;</span>
          <span className="text-ink-faint text-sm">{timeAgo}</span>
        </div>

        {/* Body */}
        <CommentBody body={comment.body} />

        {/* Actions */}
        {canReply && user && (
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="text-sm cursor-pointer text-ink-muted hover:text-primary-800 transition-colors"
          >
            {showReplyForm
              ? dictionary?.comments?.cancel || "Cancel"
              : dictionary?.comments?.reply || "Reply"}
          </button>
        )}

        {/* Reply Form */}
        {showReplyForm && user && (
          <div className="mt-4">
            <CommentForm
              path={path}
              parentId={comment.id}
              onSuccess={() => setShowReplyForm(false)}
              compact
            />
          </div>
        )}
      </div>

      {/* Nested Replies */}
      {comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              path={path}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
