import { cn } from "@/lib/utils";

/** The Arkana logo's colour. */
export const ARKANA_PURPLE = "#a777ff";

// Every segment a sigil can have, as (x1, y1, x2, y2) on the same 16-unit grid
// as arkana-pattern.tsx. The names are the ones used by its `elements`.
const SEGMENTS = {
  // Stubs reaching the edge of the cell
  left: [0, 8, 4, 8],
  right: [16, 8, 12, 8],
  top: [8, 0, 8, 4],
  bottom: [8, 16, 8, 12],
  // Rays out of the diamond's corners
  top_left_ray: [6, 6, 3, 3],
  top_right_ray: [6, 10, 3, 13], // (down and to the left, despite the name)
  bottom_left_ray: [10, 6, 13, 3],
  bottom_right_ray: [10, 10, 13, 13],
  // The diamond's eight sides
  top_left_left_side: [4, 8, 6, 6],
  top_top_left_side: [6, 6, 8, 4],
  top_top_right_side: [10, 6, 8, 4],
  top_right_right_side: [12, 8, 10, 6],
  bottom_right_right_side: [4, 8, 6, 10],
  bottom_bottom_right_side: [6, 10, 8, 12],
  bottom_bottom_left_side: [10, 10, 8, 12],
  bottom_left_left_side: [12, 8, 10, 10],
} as const;

type Segment = keyof typeof SEGMENTS;

const DIAMOND: Segment[] = [
  "top_left_left_side",
  "top_top_left_side",
  "top_top_right_side",
  "top_right_right_side",
  "bottom_right_right_side",
  "bottom_bottom_right_side",
  "bottom_bottom_left_side",
  "bottom_left_left_side",
];

interface SigilConfig {
  /** Which segments are on. */
  segments: Segment[];
  /**
   * What's in the middle of the diamond:
   * - "rhombus": a small filled rhombus
   * - "x": both diagonals crossing at the centre
   * - "backslash" / "slash": just one of the diagonals
   * - "none": empty
   */
  center: "rhombus" | "x" | "backslash" | "slash" | "none";
}

// The centre's diagonals, on the same grid as the segments above.
const DIAGONALS = {
  backslash: "M6 6L10 10", // top-left to bottom-right
  slash: "M10 6L6 10", // top-right to bottom-left
} as const;

// ---------------------------------------------------------------------------
// The key: two sigils side by side. Switch segments on or off here to reshape
// it. The bow's `right` stub and the bit's `left` stub meet to form the shaft.
// ---------------------------------------------------------------------------

/** Left sigil: the ring at the head of the key. */
const BOW: SigilConfig = {
  segments: [...DIAMOND, "right", "bottom", "top_left_ray", "left", "top_right_ray","top"],
  center: "rhombus",
};

/** Right sigil: the bit, with a long tooth and a short one hanging down. */
const BIT: SigilConfig = {
  segments: [
    "left",
    // "top_left_left_side",
    "top_top_left_side",
    "top_top_right_side",
    "top_right_right_side",
    "bottom_right_right_side",
    "bottom_bottom_right_side",
    "bottom_bottom_left_side",
    // "bottom_left_left_side",
  ],
  center: "backslash",
};

const toPath = (segments: Segment[]) =>
  segments
    .map((name) => {
      const [x1, y1, x2, y2] = SEGMENTS[name];
      return `M${x1} ${y1}L${x2} ${y2}`;
    })
    .join("");

function Sigil({
  config,
  x,
  accent,
}: {
  config: SigilConfig;
  x: number;
  accent: string;
}) {
  const { center } = config;
  // Segments and any centre diagonals share one path, so they're drawn alike.
  const path =
    toPath(config.segments) +
    (center === "x" || center === "backslash" ? DIAGONALS.backslash : "") +
    (center === "x" || center === "slash" ? DIAGONALS.slash : "");

  return (
    <g transform={`translate(${x} 0)`}>
      <path d={path} />
      {center === "rhombus" && (
        <path d="M8 7L7 8L8 9L9 8Z" fill={accent} stroke="none" />
      )}
    </g>
  );
}

interface KeySigilsProps {
  className?: string;
  /** Colour of the lines. Defaults to the Arkana purple. */
  color?: string;
  /** Colour of the small rhombus in the middle of the bow. */
  accent?: string;
}

/** Two Arkana sigils side by side, shaped like a key. */
export function KeySigils({
  className,
  color = ARKANA_PURPLE,
  accent = ARKANA_PURPLE,
}: KeySigilsProps) {
  return (
    <svg
      viewBox="0 0 32 16"
      aria-hidden="true"
      overflow="visible"
      className={cn("block", className)}
      fill="none"
      stroke={color}
      strokeWidth={0.85}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Sigil config={BOW} x={0} accent={accent} />
      <Sigil config={BIT} x={16} accent={accent} />
    </svg>
  );
}
