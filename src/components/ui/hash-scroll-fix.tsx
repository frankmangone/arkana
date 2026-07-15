"use client";

import { useEffect } from "react";

/** How long after mount we keep correcting the anchor position. */
const SETTLE_MS = 2500;

/**
 * The browser jumps to the URL hash before images and KaTeX above the
 * target have loaded, so the target drifts down as content gains height.
 * Re-align on every document resize until layout settles — or until the
 * reader scrolls on their own.
 */
export function HashScrollFix() {
  useEffect(() => {
    const hash = decodeURIComponent(window.location.hash.slice(1));
    if (!hash) return;

    const target = document.getElementById(hash);
    if (!target) return;

    const align = () => target.scrollIntoView();

    const observer = new ResizeObserver(align);
    observer.observe(document.body);

    const stop = () => observer.disconnect();
    const timer = window.setTimeout(stop, SETTLE_MS);
    window.addEventListener("wheel", stop, { once: true, passive: true });
    window.addEventListener("touchmove", stop, { once: true, passive: true });

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchmove", stop);
      observer.disconnect();
    };
  }, []);

  return null;
}
