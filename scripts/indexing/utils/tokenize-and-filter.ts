import { STOP_WORDS } from "../stop-words";
import { filterVerbsFallback } from "./filter-verbs";
import { filterVerbsPython } from "./filter-verbs";

/**
 * Tokenize text into words and filter stop words
 * @param {string} text - The text to tokenize and filter
 * @param {string} language - The language of the text
 * @returns {Promise<string[]>} The filtered words
 */
export async function tokenizeAndFilter(
  text: string,
  language: string
): Promise<string[]> {
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

  // Filter out verbs using Python spacy (with fallback)
  let finalWords: string[];

  try {
    console.log("Filtering verbs with Python spacy...");
    finalWords = await filterVerbsPython(filteredWords.join(" "), language);
    console.log("Verb filtering completed with Python spacy");
  } catch (error) {
    console.log(
      "Python verb filtering failed, using fallback:",
      (error as Error).message
    );
    finalWords = filterVerbsFallback(filteredWords, language);
  }

  return finalWords;
}
