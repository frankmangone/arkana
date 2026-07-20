import Link from "next/link";
import { StepGlyph } from "./step-glyph";

interface StepItemProps {
  order: string;
  title: string;
  url: string;
  /** Paints the glyph solid once article-read tracking is wired up (Milestone 2). Unset/false for now. */
  read?: boolean;
  /** Draws the vertical connector down to the next step. False for a module's last step. */
  showConnector: boolean;
}

export function StepItem(props: StepItemProps) {
  const { order, title, url, read, showConnector } = props;

  return (
    <li className="!m-0 relative pb-8 last:pb-0 before:!content-none">
      {showConnector && (
        <span
          aria-hidden="true"
          className="absolute left-3 top-6 h-[calc(100%-1.5rem)] w-[3px] -translate-x-1/2 bg-rule"
        />
      )}
      <Link
        href={url}
        className="group relative flex items-start gap-4 no-underline"
      >
        <StepGlyph
          read={read}
          className={read ? "text-primary-700" : "text-ink-faint"}
        />
        <span className="flex items-baseline gap-2 pt-0.5 text-base text-ink-body group-hover:text-primary-800">
          <span className="eyebrow shrink-0 tabular-nums text-ink-faint">
            {order}
          </span>
          <span>{title}</span>
        </span>
      </Link>
    </li>
  );
}
