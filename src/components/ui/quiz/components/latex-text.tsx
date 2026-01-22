import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

interface LatexTextProps {
  children: string;
  className?: string;
}

export function LatexText(props: LatexTextProps) {
  const { children, className = '' } = props;

  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        p: ({ children }) => <span className={`block ${className}`}>{children}</span>,
      }}
    >
      {children}
    </ReactMarkdown>
  );
};

