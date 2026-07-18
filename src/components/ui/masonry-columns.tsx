"use client";

import { useEffect, useState, type ReactNode } from "react";
import ArkanaPattern from "@/components/arkana-pattern";
import type { Pattern } from "@/components/arkana-strip";

export interface MasonryBreakpoint {
  minWidth: number;
  columns: number;
}

// Matches the site's md/lg breakpoints, largest first.
const DEFAULT_BREAKPOINTS: MasonryBreakpoint[] = [
  { minWidth: 1024, columns: 3 },
  { minWidth: 768, columns: 2 },
  { minWidth: 0, columns: 1 },
];

function getColumnCount(width: number, breakpoints: MasonryBreakpoint[]): number {
  return breakpoints.find((bp) => width >= bp.minWidth)?.columns ?? 1;
}

const FILLER_GLYPH: Pattern["elements"] = {
  left: true,
  right: true,
  top: true,
  bottom: true,
  top_left_ray: true,
  top_right_ray: true,
  bottom_left_ray: true,
  bottom_right_ray: true,
  top_left_left_side: false,
  top_top_left_side: false,
  top_top_right_side: false,
  top_right_right_side: false,
  bottom_right_right_side: false,
  bottom_bottom_right_side: false,
  bottom_bottom_left_side: false,
  bottom_left_left_side: false,
  central_diagonal_1: true,
  central_diagonal_2: true,
};

function MasonryFiller() {
  return (
    <div className="flex items-center justify-center rounded-md border border-rule p-10">
      <ArkanaPattern
        elements={FILLER_GLYPH}
        canvasSize={56}
        lineColor="hsla(260, 80%, 68%, 0.35)"
        backgroundColor="transparent"
      />
    </div>
  );
}

interface MasonryColumnsProps {
  /** Each element should already carry its own unique `key`. */
  items: ReactNode[];
  className?: string;
  /** Largest-first list of { minWidth, columns }. Defaults to 1/2/3 at the
   * site's base/md/lg breakpoints. */
  breakpoints?: MasonryBreakpoint[];
}

/**
 * Splits items round-robin across columns (item 1 → col 1, item 2 → col 2,
 * ... item N+1 → col 1 again) so reading order matches a regular grid, but
 * each column is its own independent flex stack — a card's real height
 * carries into where the next card in that column starts, producing a
 * masonry-style stagger instead of grid's forced-equal row heights.
 *
 * Column count follows the site's md/lg breakpoints via a resize listener
 * (no CSS-only way to repartition items responsively). A column that ends
 * up short gets a quiet decorative glyph so it doesn't trail off blank.
 *
 * Takes pre-rendered elements (not a render function) so a Server Component
 * can build the items and pass them straight through — functions can't cross
 * the server/client boundary as props, but React elements can.
 */
export function MasonryColumns({
  items,
  className,
  breakpoints = DEFAULT_BREAKPOINTS,
}: MasonryColumnsProps) {
  const [columnCount, setColumnCount] = useState(3);

  useEffect(() => {
    const update = () => setColumnCount(getColumnCount(window.innerWidth, breakpoints));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [breakpoints]);

  const columns: ReactNode[][] = Array.from(
    { length: columnCount },
    () => [] as ReactNode[]
  );
  items.forEach((item, index) => {
    columns[index % columnCount].push(item);
  });
  const maxLength = Math.max(...columns.map((column) => column.length), 0);

  return (
    <div
      className={`grid items-start gap-6 transition-opacity ${className ?? ""}`}
      style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}
    >
      {columns.map((column, columnIndex) => (
        <div key={columnIndex} className="flex flex-col gap-6">
          {column}
          {column.length > 0 && column.length < maxLength && (
            <MasonryFiller />
          )}
        </div>
      ))}
    </div>
  );
}
