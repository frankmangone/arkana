/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { ZoomableImage } from "@/components/ui/zoomable-image";
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

import { QuizDictionary } from "@/components/ui/quiz/types";

interface PostContentProps {
  post: Post;
  quizDictionary?: QuizDictionary;
}

export function PostContent({ post, quizDictionary }: PostContentProps) {
  const processedContent = processContent(post.content);

  return (
    <div className="prose prose-gray dark:prose-invert relative max-w-none mb-8">
      {/* Sticky contents rail in the right margin on wide screens */}
      <div className="hidden xl:block absolute left-full top-0 bottom-0 ml-10 w-52">
        <div className="sticky top-24">
          <TableOfContents content={post.content} compact />
        </div>
      </div>
      <div className="xl:hidden">
        <TableOfContents content={post.content} />
      </div>
      <SectionDivider />
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
          img: ZoomableImage,
          figure: Figure,
          figcaption: FigCaption,

          // Blockquotes with callout support
          blockquote: Blockquote,

          // Big quote component with LaTeX support
          // @ts-expect-error - BigQuote is a custom component
          "big-quote": BigQuote,

          // Custom div handler - selection layer for special div types
          div: (props: any) => (
            <DivSwitch {...props} quizDictionary={quizDictionary} />
          ),

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
