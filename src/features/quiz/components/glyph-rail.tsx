import type { AnswerStatus } from "@/features/quiz/types";

// Same diamond-lattice tile the buy-me-coffee GlyphMosaic uses (one diamond
// outline + center dot at the tile center and each corner, so alternate rows
// read as offset by half a cell), scaled down for a narrow rail.
const CELL =
  '<path d="M0,-26 L26,0 L0,26 L-26,0 Z" fill="none" stroke="black" stroke-width="5.5" stroke-linejoin="round"/>' +
  '<path d="M0,-7 L7,0 L0,7 L-7,0 Z" fill="black"/>';

const TILE_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
  [
    [50, 50],
    [0, 0],
    [100, 0],
    [0, 100],
    [100, 100],
  ]
    .map(([x, y]) => `<g transform="translate(${x},${y})">${CELL}</g>`)
    .join("") +
  "</svg>";

const TILE_MASK = `url("data:image/svg+xml,${encodeURIComponent(TILE_SVG)}")`;

interface GlyphRailProps {
  status: AnswerStatus;
}

/**
 * The quiz marker: a quiet diamond-lattice band hugging the card's right
 * edge, fading inward. Unlike the coffee widget's gradient mosaic this one
 * is monochrome and grades with the reader — aquamarine when the answer is
 * correct, salmon after a miss, faint violet while undecided. These match
 * the correct/incorrect vocabulary the existing inline post-quiz widget
 * already uses, rather than introducing a new pair of colors.
 */
export function GlyphRail({ status }: GlyphRailProps) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 right-0 hidden w-24 md:block transition-[background-color,opacity] duration-700 ease-out motion-reduce:transition-none"
      style={{
        backgroundColor:
          status === "correct"
            ? "var(--aquamarine-500)"
            : status === "incorrect"
              ? "var(--salmon-700)"
              : "var(--primary-700)",
        opacity: status === "correct" ? 0.55 : status === "incorrect" ? 0.45 : 0.3,
        maskImage: `${TILE_MASK}, linear-gradient(to left, black 45%, transparent 100%)`,
        maskSize: "36px 36px, 100% 100%",
        maskRepeat: "repeat, no-repeat",
        maskComposite: "intersect",
        WebkitMaskImage: `${TILE_MASK}, linear-gradient(to left, black 45%, transparent 100%)`,
        WebkitMaskSize: "36px 36px, 100% 100%",
        WebkitMaskRepeat: "repeat, no-repeat",
        WebkitMaskComposite: "source-in",
      }}
    />
  );
}
