"use client";

import { useEffect, useRef } from "react";

interface ReadingProgressProps {
  /** Element whose read-through the bar tracks. */
  targetSelector?: string;
}

/**
 * Thin fixed bar at the very top of the viewport that fills up as the
 * reader scrolls through the post body. Empty at the top of the post,
 * full once the end of the body reaches the bottom of the viewport.
 */
export function ReadingProgress({
  targetSelector = "[data-post-body]",
}: ReadingProgressProps) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = document.querySelector(targetSelector);
    const bar = barRef.current;
    if (!target || !bar) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = target.getBoundingClientRect();
      const readable = rect.height - window.innerHeight;
      const progress =
        readable > 0 ? Math.min(1, Math.max(0, -rect.top / readable)) : 1;
      bar.style.transform = `scaleX(${progress})`;
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [targetSelector]);

  return (
    // top-16 = just below the sticky h-16 navbar
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-16 z-30 h-[3px]"
    >
      <div
        ref={barRef}
        className="h-full origin-left bg-primary-750"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
