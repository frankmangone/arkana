import { Post } from "@/lib/types";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypePrism from "rehype-prism-plus";
import rehypeRaw from "rehype-raw";
import "katex/dist/katex.min.css";
import Link from "next/link";

interface PostContentProps {
  post: Post;
}

export function PostContent({ post }: PostContentProps) {
  return (
    <div className="prose prose-gray dark:prose-invert max-w-none mb-8">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[
          rehypeRaw,
          [rehypeKatex, { strict: false }],
          [rehypePrism, { showLineNumbers: true }],
        ]}
        components={{
          // Customize heading components
          h1: (props) => (
            <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />
          ),
          h2: (props) => (
            <h2 className="text-2xl font-bold mt-6 mb-3" {...props} />
          ),
          h3: (props) => (
            <h3 className="text-xl font-semibold mt-4 mb-2" {...props} />
          ),

          // Add proper spacing to paragraphs
          p: (props) => <p className="my-4" {...props} />,

          // Add custom link handling
          a: ({ href, ...props }) => {
            const isInternal =
              href && !href.startsWith("http") && !href.startsWith("#");

            if (isInternal) {
              return (
                <Link className="text-blue-500" href={href || ""} {...props} />
              );
            }

            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500"
                {...props}
              />
            );
          },
        }}
      >
        {post.content}
      </ReactMarkdown>
    </div>
  );
}
