import { LinkIcon } from "lucide-react";
import { createElement, HTMLAttributes } from "react";

export function CustomParagraph(props: HTMLAttributes<HTMLParagraphElement>) {
  return <p className="my-4" {...props} />;
}

// Function to generate slug from header text
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special chars
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/--+/g, "-") // Replace multiple hyphens with single hyphen
    .trim(); // Remove whitespace from ends
}

/* eslint-disable */
export function createHeadingComponent(level: number) {
  return ({ children, ...props }: any) => {
    // Skip if children isn't a string or doesn't exist
    if (!children || typeof children !== "string") {
      return createElement(`h${level}`, props, children);
    }

    const slug = slugify(children);

    // Map heading levels directly to appropriate classes
    const headingClasses = {
      1: "text-4xl font-bold mt-8 mb-4",
      2: "text-3xl font-bold mt-7 mb-3",
      3: "text-2xl font-semibold mt-8 mb-2",
      4: "text-xl font-semibold mt-5 mb-2",
      5: "text-lg font-medium mt-4 mb-1",
      6: "text-base font-medium mt-3 mb-1",
    };

    const className = `group flex items-center ${
      headingClasses[level as keyof typeof headingClasses] || ""
    }`;

    return createElement(`h${level}`, { id: slug, className, ...props }, [
      children,
      <a
        key="anchor"
        href={`#${slug}`}
        className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label={`Link to ${children}`}
      >
        <LinkIcon size={16} />
      </a>,
    ]);
  };
}
