/* eslint-disable @typescript-eslint/no-require-imports */
// Converts a markdown post body into plain prose for the search index -
// raw ** / [text](url) syntax reads poorly in a search result excerpt.
// LaTeX ($...$) is deliberately left untouched: a generic markdown-to-text
// pass doesn't understand it and would risk mangling equations.
function stripMarkdown(markdown) {
  return markdown
    .replace(/```[^\n]*\n([\s\S]*?)```/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/(\*\*\*|___)(.*?)\1/g, "$2")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    .replace(/^>\s?/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/^(-{3,}|\*{3,}|_{3,})\s*$/gm, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

module.exports = { stripMarkdown };
