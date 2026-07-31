import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

interface LatexTextProps {
  children: string;
  className?: string;
  /**
   * If true, renders paragraphs as inline spans (useful for inline text).
   * If false, renders paragraphs normally (useful for block content).
   * @default false
   */
  inline?: boolean;
  /**
   * Skip the paragraph wrapper entirely, rendering just the parsed content.
   * Needed when this text is one fragment among sibling elements sharing a
   * single inline flow (e.g. fill-blank template text running alongside
   * blank buttons) - a wrapping span or p would break onto its own line.
   * @default false
   */
  unwrap?: boolean;
}

export function LatexText(props: LatexTextProps) {
  const { children, className = "", inline = false, unwrap = false } = props;

  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        p: unwrap
          ? ({ children }) => <>{children}</>
          : inline
            ? ({ children }) => (
                <span className={`block ${className}`}>{children}</span>
              )
            : ({ children }) => (
                <p className={className}>{children}</p>
              ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
