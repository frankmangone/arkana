import { Post } from "@/lib/types";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypePrism from "rehype-prism-plus";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import "katex/dist/katex.min.css";
import { CustomImage } from "./content-elements/images";
import { CustomFigcaption, CustomFigure } from "./content-elements/figures";
import { CustomSeparator } from "./content-elements/separator";
import { CustomUl, CustomOl, CustomLi } from "./content-elements/lists";
import { CustomLink } from "./content-elements/links";
import {
  createHeadingComponent,
  CustomParagraph,
} from "./content-elements/text";
import { CustomDiv } from "./content-elements/div";
import { CustomVideoEmbed } from "./content-elements/video-embed";
import { CustomBlockquote } from "./content-elements/blockquote";

interface PostContentProps {
  post: Post;
}

// Custom component for rendering big quotes with LaTeX support
const BigQuote: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <span className="big-quote">{children}</span>;
};

export function PostContent({ post }: PostContentProps) {
  // Extract big quotes and create specialized tags that ReactMarkdown can handle
  // We'll use a special :::big-quote::: syntax and convert it to a custom component
  const processedContent = post.content
    // First, convert :::big-quote::: syntax to a special HTML tag we can catch later
    .replace(
      /:::\s*big-quote\s*([\s\S]*?)\s*:::/g,
      (_, content) => `<big-quote>${content}</big-quote>`
    )
    .replace(/<video-embed\s+src="([^"]+)"\s*\/>/g, (_, src) => {
      return `<div class="video-embed" data-src="${src}"></div>`;
    })
    // This regex looks for ASCII tables and converts them to GFM tables
    .replace(/\+-+\+[\s\S]*?\+-+\+/g, (match) => {
      // Extract rows from the ASCII table
      const rows = match.split("\n").filter((row) => row.trim().length > 0);
      let gfmTable = "";

      rows.forEach((row, index) => {
        if (row.startsWith("|")) {
          // This is a content row
          const cells = row
            .split("|")
            .filter((cell) => cell.trim() !== "")
            .map((cell) => cell.trim());

          gfmTable += "| " + cells.join(" | ") + " |\n";

          // If this is the header row, add the separator row
          if (index === 0) {
            gfmTable += "| " + cells.map(() => "---").join(" | ") + " |\n";
          }
        }
      });

      return gfmTable;
    })
    // Fix hyphen spacing issues by replacing spaced hyphens with non-breaking spaces
    // This preserves intended spacing around hyphens while keeping compound words intact
    // BUT we need to avoid doing this inside math expressions or markdown lists

    // First, let's protect markdown list items by temporarily replacing them
    // Also protect list items that come after colons (common pattern: "text:\n\n- item")
    .replace(/(:\s*\n\s*)-(\s)/g, "$1___LIST_ITEM_START___-$2")
    .replace(/^(\s*)-(\s)/gm, "___LIST_ITEM_START___$1-$2")

    .replace(/\s-\s/g, (match, offset, string) => {
      // Check if we're inside a math expression
      const beforeMatch = string.substring(0, offset);
      const afterMatch = string.substring(offset + match.length);

      // Count unmatched $ signs before this position (for inline math)
      const dollarsBefore = (beforeMatch.match(/\$/g) || []).length;

      // Check for display math delimiters
      const displayMathBefore = beforeMatch.lastIndexOf("$$");
      const displayMathAfter = afterMatch.indexOf("$$");
      const inlineDisplayBefore = beforeMatch.lastIndexOf("\\[");
      const inlineDisplayAfter = afterMatch.indexOf("\\]");

      // If we're inside math (odd number of $ before us, or between $$ or \[ \])
      if (
        dollarsBefore % 2 === 1 ||
        (displayMathBefore >
          beforeMatch.lastIndexOf("$$", displayMathBefore - 1) &&
          displayMathAfter !== -1) ||
        (inlineDisplayBefore > beforeMatch.lastIndexOf("\\]") &&
          inlineDisplayAfter !== -1)
      ) {
        return match; // Don't replace inside math
      }

      return "&nbsp;-&nbsp;";
    })

    // Restore the protected list items
    .replace(/___LIST_ITEM_START___/g, "")
    .replace(/\s-,/g, (match, offset, string) => {
      // Same check for comma-separated hyphens
      const beforeMatch = string.substring(0, offset);
      const dollarsBefore = (beforeMatch.match(/\$/g) || []).length;
      const displayMathBefore = beforeMatch.lastIndexOf("$$");
      const inlineDisplayBefore = beforeMatch.lastIndexOf("\\[");
      const afterMatch = string.substring(offset + match.length);
      const displayMathAfter = afterMatch.indexOf("$$");
      const inlineDisplayAfter = afterMatch.indexOf("\\]");

      if (
        dollarsBefore % 2 === 1 ||
        (displayMathBefore >
          beforeMatch.lastIndexOf("$$", displayMathBefore - 1) &&
          displayMathAfter !== -1) ||
        (inlineDisplayBefore > beforeMatch.lastIndexOf("\\]") &&
          inlineDisplayAfter !== -1)
      ) {
        return match; // Don't replace inside math
      }

      return "&nbsp;-,";
    });

  return (
    <div className="prose prose-gray dark:prose-invert max-w-none mb-8">
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[
          rehypeRaw,
          [rehypeKatex, { strict: false }],
          [rehypePrism, { showLineNumbers: true }],
        ]}
        components={{
          // Customize heading components with anchor links
          h1: createHeadingComponent(1),
          h2: createHeadingComponent(2),
          h3: createHeadingComponent(3),
          h4: createHeadingComponent(4),
          h5: createHeadingComponent(5),
          h6: createHeadingComponent(6),
          p: CustomParagraph,

          // Links
          a: CustomLink,

          // Images
          img: CustomImage,
          figure: CustomFigure,
          figcaption: CustomFigcaption,

          // Lists
          ul: CustomUl,
          ol: CustomOl,
          li: CustomLi,

          hr: CustomSeparator,

          // Blockquotes with callout support
          blockquote: CustomBlockquote,

          // Big quote component with LaTeX support
          // @ts-expect-error - BigQuote is a custom component
          "big-quote": BigQuote,

          // Add video-embed component handler
          "video-embed": CustomVideoEmbed,
          div: CustomDiv,

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
