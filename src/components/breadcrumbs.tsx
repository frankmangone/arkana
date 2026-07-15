import Link from "next/link";
import { withLocalePath } from "@/lib/site-config";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  lang: string;
  items: BreadcrumbItem[];
  className?: string;
  /** "onBrand" renders dark ink for use on the vivid hero fields */
  variant?: "default" | "onBrand";
}

/**
 * Breadcrumbs component
 *
 * Eyebrow-style breadcrumb trail. The root crumb is always the "arkana"
 * wordmark linking home; the last item renders as plain text.
 */
export function Breadcrumbs({
  lang,
  items,
  className,
  variant = "default",
}: BreadcrumbsProps) {
  const crumbs: BreadcrumbItem[] = [
    { label: "arkana", href: withLocalePath(lang) },
    ...items,
  ];

  const onBrand = variant === "onBrand";
  const linkClass = onBrand
    ? "eyebrow text-ink-on-brand-soft transition-colors hover:text-ink-on-brand"
    : "eyebrow transition-colors hover:text-ink-heading";
  const separatorClass = onBrand ? "text-ink-on-brand-soft" : "text-ink-faint";
  const currentClass = onBrand
    ? "eyebrow max-w-[16rem] truncate font-semibold text-ink-on-brand"
    : "eyebrow max-w-[16rem] truncate text-primary-800";

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="!m-0 flex flex-wrap items-center gap-2 !p-0">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li
              key={`${crumb.label}-${index}`}
              className="!m-0 flex items-center gap-2 before:!content-none"
            >
              {index > 0 && (
                <span aria-hidden="true" className={separatorClass}>
                  /
                </span>
              )}
              {crumb.href && !isLast ? (
                <Link href={crumb.href} className={linkClass}>
                  {crumb.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={currentClass}
                >
                  {crumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
