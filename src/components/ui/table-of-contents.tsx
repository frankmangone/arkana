import React from "react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

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

export function TableOfContents({ content }: TableOfContentsProps) {
  const headings = extractHeadings(content);

  if (headings.length === 0) {
    return null;
  }

  return (
    <>
      <nav className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Table of Contents
        </h2>
        <div className="space-y-2 ml-4">
          {headings.map((heading) => (
            <div key={heading.id}>
              <a
                href={`#${heading.id}`}
                className={`block text-lg text-primary-750 hover:text-primary-650 transition-colors tracking-wide ${
                  heading.level === 2
                    ? "pl-0"
                    : "pl-6"
                }`}
              >
                {heading.text}
              </a>
            </div>
          ))}
        </div>
      </nav>
      <hr />
    </>
  );
}