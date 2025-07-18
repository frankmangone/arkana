import matter from "gray-matter";

interface ParsedMarkdown {
  cleanText: string;
  title: string;
}

/**
 * Parse markdown content and extract clean text
 * @param {string} content - The markdown content to parse
 * @returns {ParsedMarkdown} The cleaned text and title
 */
export function parseMarkdown(content: string): ParsedMarkdown {
  const { data, content: markdownContent } = matter(content);

  const cleanText = markdownContent
    // Remove headers
    .replace(/^#{1,6}\s+.*$/gm, "")
    // Remove bold/italic
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    // Remove links
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // Remove images
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    // Remove lists
    .replace(/^[\s]*[-*+]\s+/gm, "")
    .replace(/^[\s]*\d+\.\s+/gm, "")
    // Remove blockquotes
    .replace(/^>\s+/gm, "")
    // Remove horizontal rules
    .replace(/^---$/gm, "")
    // Remove HTML tags
    .replace(/<[^>]*>/g, "")
    // Remove extra whitespace
    .replace(/\s+/g, " ")
    .trim();

  return { cleanText, title: data.title };
}
