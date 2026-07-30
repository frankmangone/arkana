"use client";

import { useState } from "react";
import { CommentForm } from "./comment-form";
import { useAuth } from "@/components/providers/auth-provider";
import { CommentWithReplies } from "./comment-list";
import { useParams } from "next/navigation";
import { LatexText } from "@/components/ui/latex-text";
import { useDictionary } from "@/lib/hooks/use-dictionary";
import { formatTimeAgo } from "@/lib/format-time-ago";
import { ChevronDown } from "lucide-react";

interface CommentProps {
  comment: CommentWithReplies;
  path: string;
  depth: number;
}

function CommentBody({ body }: { body: string }) {
  // Markdown collapses single newlines into spaces; turn them into hard
  // breaks so the author's line formatting survives rendering. Blank
  // lines still produce separate paragraphs.
  const withHardBreaks = body.replace(/\n/g, "  \n");

  return (
    <div className="text-ink-body mb-3 text-sm leading-relaxed break-words [&_a]:text-primary-800 [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-primary-700 [&_ul]:my-2 [&_ol]:my-2 [&_li]:my-1 [&_li]:text-sm [&_li]:leading-relaxed">
      <LatexText inline className="mb-2 last:mb-0">
        {withHardBreaks}
      </LatexText>
    </div>
  );
}

function Avatar({ url, username }: { url?: string | null; username: string }) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={username}
        className="h-6 w-6 rounded-full ring-1 ring-rule-strong"
      />
    );
  }

  return (
    <span
      aria-hidden
      className="flex h-6 w-6 items-center justify-center rounded-full bg-[image:var(--grad-brand)] text-[10px] font-semibold text-white"
    >
      {username.charAt(0).toUpperCase()}
    </span>
  );
}

const MAX_DEPTH = 3;

export function Comment({ comment, path, depth }: CommentProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const { user } = useAuth();
  const dictionary = useDictionary(lang);

  const canReply = depth < MAX_DEPTH;
  const timeAgo = formatTimeAgo(comment.created_at, dictionary, lang);

  return (
    <div
      className={
        depth > 0
          ? "border-l-2 border-rule pl-4 transition-colors hover:border-primary-700/40"
          : "rounded-lg border border-rule bg-surface-raised p-4 sm:p-5"
      }
    >
      <div>
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <Avatar
            url={comment.author_avatar_url}
            username={comment.author_username}
          />
          <span className="text-sm font-medium text-ink-heading">
            {comment.author_username}
          </span>
          <span className="text-ink-faint text-sm">&middot;</span>
          <span className="text-ink-faint text-sm">{timeAgo}</span>
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            aria-expanded={!collapsed}
            aria-label={
              collapsed
                ? dictionary?.comments?.expand || "Expand comment"
                : dictionary?.comments?.collapse || "Collapse comment"
            }
            className="ml-auto flex h-6 w-6 cursor-pointer items-center justify-center rounded-[4px] text-ink-faint hover:bg-white/5 hover:text-primary-800 transition-colors"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                collapsed ? "-rotate-90" : ""
              }`}
            />
          </button>
        </div>

        {!collapsed && (
          <>
            {/* Body */}
            <CommentBody body={comment.body} />

            {/* Actions */}
            {canReply && user && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="text-sm font-medium cursor-pointer text-ink-muted hover:text-primary-800 transition-colors"
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
          </>
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
