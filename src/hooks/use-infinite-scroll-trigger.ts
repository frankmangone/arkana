"use client";

import { useEffect, useRef } from "react";

/**
 * Attach the returned ref to a sentinel element at the end of a list; once
 * it scrolls near the viewport, `onIntersect` fires. `rootMargin` preloads
 * the next chunk before the user hits the literal bottom.
 */
export function useInfiniteScrollTrigger(
  onIntersect: () => void,
  enabled: boolean
) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) onIntersect();
      },
      { rootMargin: "400px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [onIntersect, enabled]);

  return sentinelRef;
}
