import { Post } from "@/lib/types";
import ReactMarkdown from "react-markdown";

interface PostContentProps {
  post: Post;
}

export async function PostContent({ post }: PostContentProps) {
  return (
    <div className="prose prose-gray dark:prose-invert max-w-none mb-8">
      <ReactMarkdown>{post.content}</ReactMarkdown>
    </div>
  );
}
