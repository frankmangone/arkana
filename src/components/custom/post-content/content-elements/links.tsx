import Link from "next/link";
import { AnchorHTMLAttributes } from "react";

export function CustomLink({
  href,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const isInternal = href && !href.startsWith("http") && !href.startsWith("#");

  if (isInternal) {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://arkana.blog";
    const fullHref = `${baseUrl}${href}`;
    return <Link className="text-primary-500" href={fullHref} {...props} />;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary-500"
      {...props}
    />
  );
}
