/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { PythonPlayground } from "@/components/ui/python-playground";

/**
 * `pre` override: renders runnable blocks (flagged by remarkPlayground) as an
 * interactive playground, and everything else as the usual highlighted block.
 * Without JavaScript the playground still server-renders its code.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function CodeBlock({ node, children, ...props }: any) {
  const child = React.Children.toArray(children)[0];
  if (React.isValidElement(child)) {
    const codeProps = child.props as Record<string, unknown>;
    if (codeProps["data-playground"] === "python") {
      return (
        <PythonPlayground initialCode={String(codeProps["data-source"] ?? "")} />
      );
    }
  }
  return <pre {...props}>{children}</pre>;
}
