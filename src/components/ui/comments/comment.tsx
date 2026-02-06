"use client";

import { useState, useEffect } from "react";
import { CommentForm } from "./comment-form";
import { useWallet } from "@/components/providers/wallet-provider";
import { CommentWithReplies } from "./comment-list";
import { useParams } from "next/navigation";
import { getDictionary } from "@/lib/dictionaries";
import { LatexText } from "@/components/ui/latex-text";

interface CommentProps {
  comment: CommentWithReplies;
  path: string;
  depth: number;
}

/**
 * Truncates an Ethereum address for display.
 * e.g., 0x1234...5678
 */
function truncateAddress(address: string): string {
  if (address.length <= 13) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Formats a date as relative time (e.g., "2 hours ago", "3 days ago").
 */
function formatTimeAgo(
  dateString: string,
  dictionary: any,
  lang: string
): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals: [number, { singular: string; plural: string }][] = [
    [
      31536000,
      {
        singular: dictionary?.comments?.time?.year || "year",
        plural: dictionary?.comments?.time?.years || "years",
      },
    ],
    [
      2592000,
      {
        singular: dictionary?.comments?.time?.month || "month",
        plural: dictionary?.comments?.time?.months || "months",
      },
    ],
    [
      86400,
      {
        singular: dictionary?.comments?.time?.day || "day",
        plural: dictionary?.comments?.time?.days || "days",
      },
    ],
    [
      3600,
      {
        singular: dictionary?.comments?.time?.hour || "hour",
        plural: dictionary?.comments?.time?.hours || "hours",
      },
    ],
    [
      60,
      {
        singular: dictionary?.comments?.time?.minute || "minute",
        plural: dictionary?.comments?.time?.minutes || "minutes",
      },
    ],
  ];

  const ago = dictionary?.comments?.time?.ago || "ago";
  // Spanish puts "ago" (hace) before the time unit
  const isSpanish = lang === "es";

  for (const [secondsInInterval, labels] of intervals) {
    const interval = Math.floor(seconds / secondsInInterval);
    if (interval >= 1) {
      const label = interval > 1 ? labels.plural : labels.singular;
      return isSpanish
        ? `${ago} ${interval} ${label}`
        : `${interval} ${label} ${ago}`;
    }
  }

  return dictionary?.comments?.time?.justNow || "just now";
}

/**
 * Renders comment body with LaTeX support.
 * Inline math: $...$
 * Display math: $$...$$
 */
function CommentBody({ body }: { body: string }) {
  return (
    <div className="text-primary-800 mb-2 text-sm whitespace-pre-wrap break-words">
      <LatexText className="inline">{body}</LatexText>
    </div>
  );
}

const MAX_DEPTH = 3;

export function Comment({ comment, path, depth }: CommentProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [dictionary, setDictionary] = useState<any>(null);
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const { wallet } = useWallet();

  useEffect(() => {
    getDictionary(lang).then(setDictionary);
  }, [lang]);

  const canReply = depth < MAX_DEPTH;
  const timeAgo = formatTimeAgo(comment.created_at, dictionary, lang);

  return (
    <div className={depth > 0 ? "ml-6 pl-4 border-l-2 border-border" : ""}>
      <div className="bg-primary-800/10 border border-primary-800/20 rounded-none p-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <span className="font-mono text-sm text-primary-800">
            {truncateAddress(comment.author_address)}
          </span>
          <span className="text-primary-800 text-sm">&middot;</span>
          <span className="text-primary-800 text-sm">{timeAgo}</span>
        </div>

        {/* Body */}
        <CommentBody body={comment.body} />

        {/* Actions */}
        {canReply && wallet && (
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="text-sm cursor-pointer text-primary-650 hover:text-primary-800 transition-colors"
          >
            {showReplyForm
              ? dictionary?.comments?.cancel || "Cancel"
              : dictionary?.comments?.reply || "Reply"}
          </button>
        )}

        {/* Reply Form */}
        {showReplyForm && wallet && (
          <div className="mt-4">
            <CommentForm
              path={path}
              walletAddress={wallet.address}
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
