"use client";

import { useEffect, useMemo, useState } from "react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
  compact?: boolean;
}

// Tune these to control when a section becomes "active" (scrolling down)
// vs. when it releases that state (scrolling back up). Keeping the release
// line further down than the activation line gives a dead zone in between,
// so a heading that only grazes one line while reversing direction never
// touches the other — closing the gap where the highlight could get stuck.
const ACTIVE_SECTION_ENTER_PX = 160;
const ACTIVE_SECTION_EXIT_PX = 220;

// Function to generate slug from header text (matching the one in text.tsx)
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special chars
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/--+/g, "-") // Replace multiple hyphens with single hyphen
    .trim(); // Remove whitespace from ends
}

// Extracts a custom ID from text with format "Header text {#custom-id}"
function extractCustomId(text: string): {
  cleanText: string;
  id: string | null;
} {
  const match = text.match(/\s*\{#([a-zA-Z0-9_-]+)\}\s*$/);

  if (match) {
    return {
      cleanText: text.replace(match[0], ""),
      id: match[1],
    };
  }

  return {
    cleanText: text,
    id: null,
  };
}

function extractHeadings(content: string): TocItem[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const headings: TocItem[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length; // Count # symbols
    const rawText = match[2].trim();

    // Extract custom ID or generate slug
    const { cleanText, id } = extractCustomId(rawText);
    const finalId = id || slugify(cleanText);

    headings.push({
      id: finalId,
      text: cleanText,
      level,
    });
  }

  return headings;
}

export function TableOfContents({ content, compact }: TableOfContentsProps) {
  const headings = useMemo(() => extractHeadings(content), [content]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;

    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    // Each heading's offset from the top of the document. Scroll handling
    // then becomes plain arithmetic (offset - scrollY) instead of reading
    // layout on every scroll frame.
    let offsets = elements.map((el) => el.getBoundingClientRect().top + window.scrollY);

    const updateActiveId = () => {
      const scrollY = window.scrollY;
      setActiveId((prevActiveId) => {
        const prevIndex = elements.findIndex((el) => el.id === prevActiveId);
        let currentId: string | null = null;
        for (let i = 0; i < elements.length; i++) {
          // The currently active heading needs to cross the (lower) exit
          // line before it releases; every other heading uses the (higher)
          // enter line. This is what creates the dead zone between the two.
          const line = i === prevIndex ? ACTIVE_SECTION_EXIT_PX : ACTIVE_SECTION_ENTER_PX;
          if (offsets[i] - scrollY > line) break;
          currentId = elements[i].id;
        }
        return currentId;
      });
    };

    let frame = 0;
    const scheduleUpdate = () => {
      if (!frame) frame = requestAnimationFrame(() => {
        frame = 0;
        updateActiveId();
      });
    };

    const recomputeOffsets = () => {
      offsets = elements.map((el) => el.getBoundingClientRect().top + window.scrollY);
      updateActiveId();
    };

    updateActiveId();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", recomputeOffsets, { passive: true });

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", recomputeOffsets);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [headings]);

  if (headings.length === 0) {
    return null;
  }

  if (compact) {
    return (
      <nav>
        <p className="eyebrow mb-4 text-primary-800">Contents</p>
        <div className="space-y-2.5 border-l border-rule pl-4">
          {headings.map((heading) => (
            <div key={heading.id}>
              <a
                href={`#${heading.id}`}
                aria-current={heading.id === activeId ? "location" : undefined}
                className={`block text-sm leading-snug transition-colors hover:text-ink-heading ${
                  heading.id === activeId ? "text-white" : "text-ink-muted"
                } ${heading.level === 2 ? "pl-0" : "pl-4"}`}
              >
                {heading.text}
              </a>
            </div>
          ))}
        </div>
      </nav>
    );
  }

  return (
    <nav className="mb-8 rounded-md border border-rule p-6">
      <p className="eyebrow mb-4 text-primary-800">Contents</p>
      <div className="space-y-2.5">
        {headings.map((heading) => (
          <div key={heading.id}>
            <a
              href={`#${heading.id}`}
              aria-current={heading.id === activeId ? "location" : undefined}
              className={`block leading-snug transition-colors hover:text-ink-heading ${
                heading.id === activeId ? "text-white" : "text-ink-muted"
              } ${heading.level === 2 ? "pl-0" : "pl-5"}`}
            >
              {heading.text}
            </a>
          </div>
        ))}
      </div>
    </nav>
  );
}
