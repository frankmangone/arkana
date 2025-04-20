import Link from "next/link";
import { AnchorHTMLAttributes } from "react";

export function CustomLink({
  href,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const isInternal = href && !href.startsWith("http") && !href.startsWith("#");

  if (isInternal) {
    return <Link className="text-blue-500" href={href} {...props} />;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-500"
      {...props}
    />
  );
}
