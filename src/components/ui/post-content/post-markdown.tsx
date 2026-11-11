/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypePrism from "rehype-prism-plus";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { processContent } from "./process-content";
import { remarkPlayground } from "./remark-playground";
import { CodeBlock } from "./code-block";
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
import { isHiddenPostHref } from "@/lib/posts/hidden-links";
import { getHiddenPostKeys } from "@/lib/posts/translations";
import type { Post } from "@/lib/types";
import type { QuizDictionary } from "@/components/ui/quiz/types";
import type { KeyConceptsDictionary } from "@/components/ui/key-concepts";

// Links from a visible post to a visible: false post render as plain text,
// so drafts are only reachable by someone who already has their URL. A
// hidden post keeps its links to other drafts working, for previewing.
export async function resolveHiddenPostKeys(post: Post): Promise<Set<string>> {
  return post.metadata.visible === false
    ? new Set<string>()
    : await getHiddenPostKeys();
}

interface PostMarkdownProps {
  content: string;
  hiddenPostKeys: Set<string>;
  quizDictionary?: QuizDictionary;
  keyConceptsDictionary?: KeyConceptsDictionary;
}

/** Renders post markdown with the site's custom components. */
export function PostMarkdown({
  content,
  hiddenPostKeys,
  quizDictionary,
  keyConceptsDictionary,
}: PostMarkdownProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath, remarkGfm, remarkPlayground]}
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
        a: (props: any) =>
          isHiddenPostHref(props.href, hiddenPostKeys) ? (
            <>{props.children}</>
          ) : (
            <Link {...props} />
          ),
        hr: SectionDivider,

        // Lists
        ul: UnorderedList,
        ol: OrderedList,
        li: ListElement,

        // Images
        img: ZoomableImage,
        figure: Figure,
        figcaption: FigCaption,

        // Code blocks, with runnable Python playgrounds
        pre: CodeBlock,

        // Blockquotes with callout support
        blockquote: Blockquote,

        // Big quote component with LaTeX support
        // @ts-expect-error - BigQuote is a custom component
        "big-quote": BigQuote,

        // Custom div handler - selection layer for special div types
        div: (props: any) => (
          <DivSwitch
            {...props}
            quizDictionary={quizDictionary}
            keyConceptsDictionary={keyConceptsDictionary}
          />
        ),

        // Add wrapper for tables to ensure proper overflow handling
        table: (props) => (
          <div className="table-container">
            <table {...props} />
          </div>
        ),
      }}
    >
      {processContent(content)}
    </ReactMarkdown>
  );
}
