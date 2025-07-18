import { STOP_WORDS } from "../stop-words";

/**
 * Tokenize text into words and filter stop words
 * @param {string} text - The text to tokenize and filter
 * @param {string} language - The language of the text
 * @returns {string[]} The filtered words
 */
export function tokenizeAndFilter(text: string, language: string): string[] {
  // Convert to lowercase and split into words
  const words = text
    .toLowerCase()
    .replace(/[^\w\s\u00C0-\u017F]/g, " ") // Remove punctuation but keep accented characters
    .split(/\s+/)
    .filter((word) => word.length > 0);

  // Filter out stop words & short words
  const stopWords =
    STOP_WORDS[language as keyof typeof STOP_WORDS] || STOP_WORDS.en;
  const filteredWords = words.filter(
    (word) => !stopWords.has(word) && word.length > 2
  );

  console.log("Total filtered words:", filteredWords.length);

  return filteredWords;
}
