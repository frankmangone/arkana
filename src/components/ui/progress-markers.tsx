import { cn } from "@/lib/utils";

interface ProgressMarkerProps {
  /** The current step: drawn solid. Every other step is an empty outline. */
  active: boolean;
  className?: string;
}

/**
 * One step marker: the rotated-square glyph the reading lists use, solid when
 * it's the current step and an empty outline otherwise. Takes its colour from
 * the text colour.
 */
export function ProgressMarker({ active, className }: ProgressMarkerProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      overflow="visible"
      className={cn("h-4 w-4 transition-colors", className)}
    >
      <path
        d="M12 0 L24 12 L12 24 L0 12 Z"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface ProgressMarkersProps {
  total: number;
  /** Zero-based index of the current step. */
  index: number;
  onSelect: (index: number) => void;
  /** Accessible name for each marker's button; "{n}" becomes its number. */
  label: string;
  className?: string;
}

/** A row of step markers, each a button that jumps to its step. */
export function ProgressMarkers({
  total,
  index,
  onSelect,
  label,
  className,
}: ProgressMarkersProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(i)}
          aria-label={label.replace("{n}", String(i + 1))}
          aria-current={i === index}
          className="group flex h-7 w-7 cursor-pointer items-center justify-center rounded-[3px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <ProgressMarker
            active={i === index}
            className={
              i === index
                ? "text-primary-700"
                : "text-primary-700/55 group-hover:text-primary-700"
            }
          />
        </button>
      ))}
    </div>
  );
}
