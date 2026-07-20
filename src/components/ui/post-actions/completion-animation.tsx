interface CompletionAnimationProps {
  label: string;
}

/**
 * Celebratory sigil shown once a reader scrolls to the end of an article.
 * Rotated-square + tick pops in first, then the rays burst outward — see
 * the sigil-pop/sigil-rays/sigil-check/sigil-text keyframes in globals.css.
 * Flanked by the same hairline rules as SectionDivider, since it replaces
 * the divider that used to sit right after the article body.
 */
export function CompletionAnimation({ label }: CompletionAnimationProps) {
  return (
    <div role="status" className="my-12 flex items-center justify-center gap-6">
      <span className="h-px w-full max-w-24 bg-rule" aria-hidden="true" />
      <div className="flex shrink-0 items-center gap-3">
        <svg viewBox="0 0 100 100" className="h-11 w-11 shrink-0" fill="none">
          <g
            className="animate-sigil-rays"
            stroke="#a777ff"
            strokeWidth="3"
            strokeLinecap="round"
          >
            <line x1="50" y1="14" x2="50" y2="28" />
            <line x1="50" y1="72" x2="50" y2="86" />
            <line x1="14" y1="50" x2="28" y2="50" />
            <line x1="72" y1="50" x2="86" y2="50" />
            <line x1="26" y1="26" x2="36" y2="36" />
            <line x1="74" y1="26" x2="64" y2="36" />
            <line x1="26" y1="74" x2="36" y2="64" />
            <line x1="74" y1="74" x2="64" y2="64" />
          </g>
          <g className="animate-sigil-pop">
            <rect
              x="37"
              y="37"
              width="26"
              height="26"
              rx="2"
              transform="rotate(45 50 50)"
              fill="rgba(167, 119, 255, 0.12)"
              stroke="#a777ff"
              strokeWidth="3"
            />
            <path
              className="animate-sigil-check"
              d="M43 51 L48 55 L57 45"
              stroke="#a777ff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </svg>
        <p className="animate-sigil-text text-lg text-primary">{label}</p>
      </div>
      <span className="h-px w-full max-w-24 bg-rule" aria-hidden="true" />
    </div>
  );
}
