import { Post } from "@/lib/types";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypePrism from "rehype-prism-plus";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { processContent } from "./process-content";
import "katex/dist/katex.min.css";
import { PostImage } from "@/components/ui/images";
import { DivSwitch } from "@/components/ui/div-switch";
import { Figure, FigCaption } from "@/components/ui/figures";
import { AnchoredHeading } from "@/components/ui/anchored-heading";
import { BigQuote } from "@/components/ui/big-quote";
import { Blockquote } from "@/components/ui/blockquote";
import { Link } from "@/components/ui/link";
import { UnorderedList, OrderedList, ListElement } from "@/components/ui/lists";
import { Paragraph } from "@/components/ui/paragraph";
import { SectionDivider } from "@/components/ui/section-divider";
import { TableOfContents } from "@/components/ui/table-of-contents";

interface PostContentProps {
  post: Post;
  quizDictionary?: {
    submitAnswer: string;
    correct: string;
    almost: string;
    incorrect: string;
    multipleChoice: string;
    singleChoice: string;
  };
}

export function PostContent({ post, quizDictionary }: PostContentProps) {
  const processedContent = processContent(post.content)

  return (
    <div className="prose prose-gray dark:prose-invert max-w-none mb-8">
      <TableOfContents content={post.content} />
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[
          rehypeRaw,
          [rehypeKatex, { strict: false }],
          [rehypePrism, { showLineNumbers: true }],
        ]}
        components={{
          // Text components
          // h1: createHeadingComponent(1),
          h2: (props: any) => <AnchoredHeading size="lg" {...props} />,
          h3: (props: any) => <AnchoredHeading size="sm" {...props} />,
          // h4: createHeadingComponent(4),
          // h5: createHeadingComponent(5),
          // h6: createHeadingComponent(6),
          p: Paragraph,
          a: Link,
          hr: SectionDivider,

          // Lists
          ul: UnorderedList,
          ol: OrderedList,
          li: ListElement,

          // Images
          img: PostImage,
          figure: Figure,
          figcaption: FigCaption,

          // Blockquotes with callout support
          blockquote: Blockquote,

          // Big quote component with LaTeX support
          // @ts-expect-error - BigQuote is a custom component
          "big-quote": BigQuote,

          // Custom div handler - selection layer for special div types
          div: (props: any) => <DivSwitch {...props} quizDictionary={quizDictionary} />,

          // Add wrapper for tables to ensure proper overflow handling
          table: (props) => (
            <div className="table-container">
              <table {...props} />
            </div>
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}
