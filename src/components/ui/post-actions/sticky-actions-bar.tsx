"use client";

import { useEffect, useState } from "react";
import { PostActions } from "./index";

interface StickyActionsBarProps {
  path: string;
}

/**
 * Mobile-only floating action row. Appears once the header's own actions
 * scroll out of view, and hides again once the article body has been
 * scrolled past — so it never lingers over the comments/footer.
 */
export function StickyActionsBar({ path }: StickyActionsBarProps) {
  const [headerHidden, setHeaderHidden] = useState(false);
  const [pastContent, setPastContent] = useState(false);

  useEffect(() => {
    const anchor = document.querySelector("[data-post-actions-anchor]");
    const body = document.querySelector("[data-post-body]");
    if (!anchor || !body) return;

    const anchorObserver = new IntersectionObserver(
      ([entry]) => setHeaderHidden(!entry.isIntersecting),
      { threshold: 0 }
    );
    anchorObserver.observe(anchor);

    const bodyObserver = new IntersectionObserver(
      ([entry]) =>
        setPastContent(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 }
    );
    bodyObserver.observe(body);

    return () => {
      anchorObserver.disconnect();
      bodyObserver.disconnect();
    };
  }, []);

  const visible = headerHidden && !pastContent;

  return (
    <div
      className={`fixed inset-x-0 top-16 z-30 border-b border-rule bg-surface-page/95 backdrop-blur-sm transition-transform duration-200 md:hidden ${
        visible ? "translate-y-0" : "-translate-y-full pointer-events-none"
      }`}
    >
      <div className="flex justify-center py-2.5">
        <PostActions path={path} className="gap-8" />
      </div>
    </div>
  );
}
