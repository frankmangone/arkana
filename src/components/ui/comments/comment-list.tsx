"use client";

import { CommentResponse } from "@/lib/api/services/posts";
import { Comment } from "./comment";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useDictionary } from "@/lib/hooks/use-dictionary";

interface CommentListProps {
  comments: CommentResponse[];
  path: string;
}

export interface CommentWithReplies extends CommentResponse {
  replies: CommentWithReplies[];
}

/**
 * Organizes flat comments into a threaded structure.
 */
function buildCommentTree(comments: CommentResponse[]): CommentWithReplies[] {
  const commentMap = new Map<number, CommentWithReplies>();
  const rootComments: CommentWithReplies[] = [];

  // First pass: create map of all comments with empty replies arrays
  for (const comment of comments) {
    commentMap.set(comment.id, { ...comment, replies: [] });
  }

  // Second pass: organize into tree structure
  for (const comment of comments) {
    const commentWithReplies = commentMap.get(comment.id)!;
    if (comment.parent_id === null) {
      rootComments.push(commentWithReplies);
    } else {
      const parent = commentMap.get(comment.parent_id);
      if (parent) {
        parent.replies.push(commentWithReplies);
      } else {
        // Parent not found, treat as root comment
        rootComments.push(commentWithReplies);
      }
    }
  }

  return rootComments;
}

export function CommentList({ comments, path }: CommentListProps) {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const dictionary = useDictionary(lang);

  const threadedComments = useMemo(
    () => buildCommentTree(comments),
    [comments]
  );

  if (comments.length === 0) {
    return (
      <div className="text-secondary-800 text-sm py-4">
        {dictionary?.comments?.noComments || "No comments yet. Be the first to comment!"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {threadedComments.map((comment) => (
        <Comment key={comment.id} comment={comment} path={path} depth={0} />
      ))}
    </div>
  );
}
