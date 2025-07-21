import { HTMLAttributes } from "react";
import React from "react";

interface CustomBlockquoteProps extends HTMLAttributes<HTMLQuoteElement> {
  children?: React.ReactNode;
}

export function CustomBlockquote({
  children,
  className,
  ...props
}: CustomBlockquoteProps) {
  // Simple approach: convert all children to string
  const getAllText = (node: React.ReactNode): string => {
    if (typeof node === "string") return node;
    if (typeof node === "number") return String(node);
    if (Array.isArray(node)) return node.map(getAllText).join("");
    if (React.isValidElement(node)) {
      const element = node as React.ReactElement<{
        children?: React.ReactNode;
      }>;
      if (element.props.children) {
        return getAllText(element.props.children);
      }
    }
    return "";
  };

  const fullText = getAllText(children);

  // Check for callout syntax
  const calloutMatch = fullText.match(
    /\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i
  );

  if (calloutMatch) {
    const calloutType = calloutMatch[1].toLowerCase();
    const calloutClass = `callout-${calloutType}`;

    // Remove the callout syntax from the text and preserve the original children structure
    const processChildren = (node: React.ReactNode): React.ReactNode => {
      if (typeof node === "string") {
        return node.replace(
          /\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i,
          ""
        );
      }
      if (React.isValidElement(node)) {
        const element = node as React.ReactElement<{
          children?: React.ReactNode;
        }>;
        if (element.props.children) {
          return React.cloneElement(element, {
            ...element.props,
            children: processChildren(element.props.children),
          });
        }
      }
      if (Array.isArray(node)) {
        return node.map(processChildren);
      }
      return node;
    };

    const cleanedChildren = React.Children.map(children, processChildren);

    return (
      <blockquote className={`${calloutClass} ${className || ""}`} {...props}>
        {cleanedChildren}
      </blockquote>
    );
  }

  // Regular blockquote
  return (
    <blockquote className={className} {...props}>
      {children}
    </blockquote>
  );
}
