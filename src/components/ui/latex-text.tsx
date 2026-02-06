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
}

export function LatexText(props: LatexTextProps) {
  const { children, className = "", inline = false } = props;

  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        p: inline
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
