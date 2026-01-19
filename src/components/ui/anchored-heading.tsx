import { LinkIcon } from "lucide-react";
import { createElement, HTMLAttributes } from "react";

const SIZES = {
  LG: "lg",
  SM: "sm",
} as const;

// Function to generate slug from header text
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
    // Return the text without the ID part and the extracted ID
    return {
      cleanText: text.replace(match[0], ""),
      id: match[1],
    };
  }

  // No custom ID found
  return {
    cleanText: text,
    id: null,
  };
}

interface AnchoredHeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  size: (typeof SIZES)[keyof typeof SIZES];
  children: React.ReactNode;
}

/**
 * AnchoredHeading component
 * 
 * This component is used to display a heading with an anchor link.
 * It is a heading with an anchor link that can be used to link to the heading.
 * 
 * @param {AnchoredHeadingProps} props - The props for the AnchoredHeading component
 * @returns {JSX.Element} The AnchoredHeading component
 */
export function AnchoredHeading(props: AnchoredHeadingProps) {
    const { size, children, ...rest } = props;

    const level = size === SIZES.LG ? 2 : 3;

    // Skip if children isn't a string or doesn't exist
    if (!children || typeof children !== "string") {
        return createElement(`h${level}`, props, children);
    }
  
    // Check for custom ID in the heading text
    const { cleanText, id } = extractCustomId(children);
  
    // Use custom ID if provided, otherwise generate a slug
    const slug = id || slugify(cleanText);

    // Map heading levels directly to appropriate classes
    const headingClasses = {
        lg: "text-3xl font-bold mt-7 mb-4",
        sm: "text-2xl font-semibold mt-8 mb-3",
    };

    // Other possible sizes:
    // ------------------------------------------------------------
    // 1: "text-4xl font-bold mt-8 mb-4",
    // 2: "text-3xl font-bold mt-7 mb-4",
    // 3: "text-2xl font-semibold mt-8 mb-3",
    // 4: "text-xl font-semibold mt-5 mb-3",
    // 5: "text-lg font-medium mt-4 mb-2",
    // 6: "text-base font-medium mt-3 mb-2",

    const className = `group flex items-center ${
        headingClasses[size] || ""
    }`;

    return createElement(`h${level}`, { id: slug, className, ...rest }, [
        cleanText, // Use the text without the ID part
        <a
            key="anchor"
            href={`#${slug}`}
            className="ml-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
            aria-label={`Link to ${cleanText}`}
        >
            <LinkIcon className="text-primary-500" size={22} />
        </a>,
    ]);
};
