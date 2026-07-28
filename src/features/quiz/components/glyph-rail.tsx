"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { AnswerStatus } from "@/features/quiz/types";

// The rail/band keeps the staggered diamond lattice of the buy-me-coffee
// GlyphMosaic (36px tile: sigils at each tile's center and corners, lying
// on diagonal lines), but every tile is a real Arkana glyph drawn from the
// same element vocabulary as arkana-pattern.tsx (17×17 grid coordinates,
// scaled to the tile). Grading decodes each sigil in place — only which
// segments are lit changes, never where the sigil sits. Same pattern as
// the coffee widget's mobile/desktop split too: a full-width band on top
// for mobile, a narrow rail on the side for desktop.
const TILE = 36;
const STEP = TILE / 2; // lattice pitch
const CELL = TILE / 16; // arkana-pattern grid cell, scaled to the tile
const STROKE = 1.8;

const RAIL_WIDTH = 96; // w-24
const RAIL_HEIGHT = 1080; // generous; container clips the overflow
const BAND_WIDTH = 480; // generous virtual canvas; "slice" covers any card width
const BAND_HEIGHT = 64; // h-16

function buildPositions(width: number, height: number): Array<[number, number]> {
  const positions: Array<[number, number]> = [];
  for (let row = 0; row * STEP <= height; row++) {
    for (let col = 0; col * STEP <= width; col++) {
      if ((row + col) % 2 === 0) positions.push([col * STEP, row * STEP]);
    }
  }
  return positions;
}

const RAIL_POSITIONS = buildPositions(RAIL_WIDTH, RAIL_HEIGHT);
const BAND_POSITIONS = buildPositions(BAND_WIDTH, BAND_HEIGHT);

// Grid-unit segment endpoints from arkana-pattern.tsx, center at (8,8).
const seg = (x1: number, y1: number, x2: number, y2: number) =>
  `M${(x1 - 8) * CELL},${(y1 - 8) * CELL} L${(x2 - 8) * CELL},${(y2 - 8) * CELL}`;

// One path string per element bit. Bits 0-7: the eight side segments (the
// glyph's diamond outline). Bits 8-11: the four outward diagonal rays.
// Bit 12: the inner X strokes. Bit 13 is the filled center rhombus,
// rendered separately since it's a fill, not a stroke.
const SEGMENT_PATHS: string[] = [
  seg(4, 8, 6, 6), // side: left → top-left
  seg(6, 6, 8, 4), // side: top-left → top
  seg(10, 6, 8, 4), // side: top-right → top
  seg(12, 8, 10, 6), // side: right → top-right
  seg(4, 8, 6, 10), // side: left → bottom-left
  seg(6, 10, 8, 12), // side: bottom-left → bottom
  seg(10, 10, 8, 12), // side: bottom-right → bottom
  seg(12, 8, 10, 10), // side: right → bottom-right
  seg(6, 6, 3, 3), // ray: up-left
  seg(6, 10, 3, 13), // ray: down-left
  seg(10, 6, 13, 3), // ray: up-right
  seg(10, 10, 13, 13), // ray: down-right
  seg(6, 6, 10, 10) + " " + seg(10, 6, 6, 10), // inner X
];
const BIT_X = 1 << 12;
const BIT_DOT = 1 << 13;
const SIDES =
  (1 << 0) | (1 << 1) | (1 << 2) | (1 << 3) | (1 << 4) | (1 << 5) | (1 << 6) | (1 << 7);
const RAYS = (1 << 8) | (1 << 9) | (1 << 10) | (1 << 11);

// Center rhombus: (8,7) (7,8) (8,9) (9,8) in grid units, filled.
const DOT_PATH = `M0,${-CELL} L${-CELL},0 L0,${CELL} L${CELL},0 Z`;

// Idle: outline + center rhombus — the mosaic tile as it always looks.
// Both graded states add the outward diagonal rays, so sigils connecting
// into the lattice reads as "answered" — the center then tells you how:
// rhombus for correct, X for incorrect.
const GLYPH_IDLE = SIDES | BIT_DOT;
const GLYPH_CORRECT = SIDES | BIT_DOT | RAYS;
const GLYPH_INCORRECT = SIDES | BIT_X | RAYS;

const DECODE_TICKS = 9;
const TICK_MS = 40; // full decode in ~360ms

function randomGlyph(): number {
  return Math.floor(Math.random() * (1 << 14));
}

/** rank[i] = the step at which sigil i locks onto the target glyph. */
function shuffledRanks(count: number): number[] {
  const order = Array.from({ length: count }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const rank = new Array<number>(count);
  order.forEach((sigil, position) => {
    rank[sigil] = position;
  });
  return rank;
}

function Sigil({ x, y, bits }: { x: number; y: number; bits: number }) {
  const strokes = SEGMENT_PATHS.filter((_, bit) => bits & (1 << bit));

  return (
    <g transform={`translate(${x},${y})`}>
      {strokes.length > 0 && (
        <path
          d={strokes.join(" ")}
          fill="none"
          stroke="currentColor"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {(bits & BIT_DOT) !== 0 && <path d={DOT_PATH} fill="currentColor" />}
    </g>
  );
}

interface GlyphRailProps {
  status: AnswerStatus;
  /** "rail" (default): narrow band hugging the right edge, desktop-only.
   * "band": full-width strip across the top, mobile-only — same idea as
   * the buy-me-coffee widget's mobile/desktop mosaic split. */
  layout?: "rail" | "band";
}

/**
 * The quiz marker: the house glyph lattice, fading inward. On grading,
 * every sigil stays exactly where it is and decodes in place — a fast
 * decoder-sigil-style scramble locking into outline + rays + center
 * (correct, aquamarine) or outline + inner X (incorrect, salmon). Colors
 * match the correct/incorrect vocabulary the existing inline post-quiz
 * widget already uses.
 */
export function GlyphRail({ status, layout = "rail" }: GlyphRailProps) {
  const positions = layout === "band" ? BAND_POSITIONS : RAIL_POSITIONS;
  const sigilCount = positions.length;

  const [glyphs, setGlyphs] = useState<number[]>(() =>
    Array(sigilCount).fill(GLYPH_IDLE)
  );
  const prevStatus = useRef<AnswerStatus>("idle");

  useEffect(() => {
    if (status === prevStatus.current) return;
    prevStatus.current = status;

    const target =
      status === "correct"
        ? GLYPH_CORRECT
        : status === "incorrect"
          ? GLYPH_INCORRECT
          : GLYPH_IDLE;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setGlyphs(Array(sigilCount).fill(target));
      return;
    }

    const rank = shuffledRanks(sigilCount);
    const lockPerTick = Math.ceil(sigilCount / DECODE_TICKS);
    let locked = 0;

    const interval = window.setInterval(() => {
      locked = Math.min(sigilCount, locked + lockPerTick);
      setGlyphs(
        Array.from({ length: sigilCount }, (_, i) =>
          rank[i] < locked ? target : randomGlyph()
        )
      );
      if (locked >= sigilCount) window.clearInterval(interval);
    }, TICK_MS);

    return () => window.clearInterval(interval);
  }, [status, sigilCount]);

  const isBand = layout === "band";

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none overflow-hidden",
        "transition-[color,opacity] duration-500 ease-out motion-reduce:transition-none",
        isBand
          // -mt-6 cancels Card's own py-6 so the band sits flush against
          // the card's top edge instead of floating in the padding gap —
          // the rail doesn't need this since inset-y-0 on an absolutely
          // positioned element is measured from the padding edge already.
          ? "-mt-6 block h-16 w-full rounded-t-md md:hidden"
          : "absolute inset-y-0 right-0 hidden w-24 md:block",
        status === "correct"
          ? "text-aquamarine-500 opacity-55"
          : status === "incorrect"
            ? "text-salmon-700 opacity-45"
            : "text-primary-700 opacity-30"
      )}
      style={{
        maskImage: isBand
          ? "linear-gradient(to bottom, black 45%, transparent 100%)"
          : "linear-gradient(to left, black 45%, transparent 100%)",
        WebkitMaskImage: isBand
          ? "linear-gradient(to bottom, black 45%, transparent 100%)"
          : "linear-gradient(to left, black 45%, transparent 100%)",
      }}
    >
      {isBand ? (
        <svg
          viewBox={`0 0 ${BAND_WIDTH} ${BAND_HEIGHT}`}
          preserveAspectRatio="xMinYMin slice"
          className="block h-full w-full"
        >
          {positions.map(([x, y], i) => (
            <Sigil key={i} x={x} y={y} bits={glyphs[i]} />
          ))}
        </svg>
      ) : (
        <svg
          width={RAIL_WIDTH}
          height={RAIL_HEIGHT}
          viewBox={`0 0 ${RAIL_WIDTH} ${RAIL_HEIGHT}`}
          className="block"
        >
          {positions.map(([x, y], i) => (
            <Sigil key={i} x={x} y={y} bits={glyphs[i]} />
          ))}
        </svg>
      )}
    </div>
  );
}
