import { default as NextLink } from "next/link";
import { AnchorHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

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
  const safeHref = href ?? "#";
  const isExternal =
    safeHref.startsWith("http://") ||
    safeHref.startsWith("https://") ||
    safeHref.startsWith("mailto:") ||
    safeHref.startsWith("tel:");

  if (!isExternal) {
    return (
      <NextLink
        className={cn(
          "text-primary-750 hover:text-primary-650 transition-colors",
          className
        )}
        href={safeHref}
        {...props}
      />
    );
  }

  return (
    <a
      href={safeHref}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "text-primary-750 hover:text-primary-650 transition-colors",
        className
      )}
      {...props}
    />
  );
}
