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
}

/**
 * Breadcrumbs component
 *
 * Eyebrow-style breadcrumb trail. The root crumb is always the "arkana"
 * wordmark linking home; the last item renders as plain text.
 */
export function Breadcrumbs({ lang, items, className }: BreadcrumbsProps) {
  const crumbs: BreadcrumbItem[] = [
    { label: "arkana", href: withLocalePath(lang) },
    ...items,
  ];

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
                <span aria-hidden="true" className="text-ink-faint">
                  /
                </span>
              )}
              {crumb.href && !isLast ? (
                <Link
                  href={crumb.href}
                  className="eyebrow transition-colors hover:text-ink-heading"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className="eyebrow max-w-[16rem] truncate text-primary-800"
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
