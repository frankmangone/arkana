import type { ReactNode, Ref } from "react";
import { cn } from "@/lib/utils";

interface EmbedCardProps {
  /** Short uppercase tag in the header, e.g. "Python". */
  label: string;
  icon?: ReactNode;
  /** Controls rendered on the right of the header. */
  actions?: ReactNode;
  /** Content below the body, separated by a rule (e.g. cell output). */
  footer?: ReactNode;
  className?: string;
  ref?: Ref<HTMLDivElement>;
  children: ReactNode;
}

/**
 * Shared chrome for interactive embeds (Python playground, future 3D scenes,
 * etc.), so every embed reads as part of the same Arkana system: a bordered
 * raised surface with a slim labelled header, like the quiz header.
 */
export function EmbedCard({
  label,
  icon,
  actions,
  footer,
  className,
  ref,
  children,
}: EmbedCardProps) {
  return (
    <div
      ref={ref}
      className={cn(
        "not-prose my-8 w-full overflow-hidden rounded-md border border-rule-strong bg-surface-raised",
        className
      )}
    >
      <div className="flex h-11 items-center justify-between gap-3 border-b border-rule px-4">
        <div className="flex items-center gap-2 text-primary-800">
          {icon && <span className="[&_svg]:size-4">{icon}</span>}
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.16em]">
            {label}
          </span>
        </div>
        {actions && <div className="flex items-center gap-1.5">{actions}</div>}
      </div>
      {children}
      {footer && <div className="border-t border-rule">{footer}</div>}
    </div>
  );
}
