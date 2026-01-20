import{ default as NextLink } from "next/link";
import { AnchorHTMLAttributes } from "react";

/**
 * Link component
 * 
 * This component is used to display a link.
 * It is a link that can be used to link to a page.
 * 
 * @param {AnchorHTMLAttributes<HTMLAnchorElement>} props - The props for the Link component
 * @returns {JSX.Element} The Link component
 */
export function Link({
  href,
  className,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const isInternal = href && !href.startsWith("http") && !href.startsWith("#");

  if (isInternal) {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://arkana.blog";
    const fullHref = `${baseUrl}${href}`;
    return <NextLink className={`text-primary-750 hover:text-primary-650 transition-colors ${className}`} href={fullHref} {...props} />;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`text-primary-750 hover:text-primary-650 transition-colors ${className}`}
      {...props}
    />
  );
}
