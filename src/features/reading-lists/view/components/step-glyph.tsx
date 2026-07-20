interface StepGlyphProps {
  /** Paints the glyph solid once article-read tracking is wired up (Milestone 2). Unset/false for now. */
  read?: boolean;
  className?: string;
}

/** The Arkana rotated-square glyph, standing in for a step marker in the journey stepper. */
export function StepGlyph({ read, className }: StepGlyphProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      overflow="visible"
      className={`h-6 w-6 shrink-0 ${className ?? ""}`}
    >
      <path
        d="M12 0 L24 12 L12 24 L0 12 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
      />
      {read && <path d="M12 7 L17 12 L12 17 L7 12 Z" fill="currentColor" />}
    </svg>
  );
}
