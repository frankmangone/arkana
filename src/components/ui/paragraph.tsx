import { HTMLAttributes } from "react";

export function Paragraph(props: HTMLAttributes<HTMLParagraphElement>) {
  return <p className="my-4" {...props} />;
}
