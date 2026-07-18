"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Tag } from "@/components/ui/tag";
import { Badge } from "@/components/ui/badge";

interface TagListProps {
  tags: string[];
  lang: string;
  /** Rows of tags to allow before collapsing the rest into a "+N more" pill */
  maxLines?: number;
}

/**
 * Wraps tags across up to `maxLines` rows; whatever doesn't fit collapses
 * into an inert "+N more" pill instead of being clipped mid-row. Re-measures
 * on container resize since a breakpoint switch changes how much fits.
 */
export function TagList({ tags, lang, maxLines = 2 }: TagListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(tags.length);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => setVisibleCount(tags.length));
    observer.observe(container);
    return () => observer.disconnect();
  }, [tags]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || visibleCount === 0) return;

    const children = Array.from(container.children) as HTMLElement[];
    const rowTops: number[] = [];
    const rowOf = (top: number) => {
      const existing = rowTops.findIndex((t) => Math.abs(t - top) < 2);
      if (existing !== -1) return existing;
      rowTops.push(top);
      return rowTops.length - 1;
    };

    const overflowed = children.some(
      (child) => rowOf(child.offsetTop) >= maxLines
    );
    if (overflowed) {
      setVisibleCount((count) => Math.max(0, count - 1));
    }
    // Deliberately re-runs on every visibleCount change: each decrement
    // re-measures the smaller set (now including the "+N" pill) until it
    // fits within maxLines.
  }, [visibleCount, maxLines]);

  const hiddenCount = tags.length - visibleCount;
  const shown = tags.slice(0, visibleCount);

  return (
    <div ref={containerRef} className="flex flex-wrap gap-2">
      {shown.map((tag) => (
        <Tag key={tag} tag={tag} lang={lang} />
      ))}
      {hiddenCount > 0 && <Badge variant="default">+{hiddenCount} more</Badge>}
    </div>
  );
}
