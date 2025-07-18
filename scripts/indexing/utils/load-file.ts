import * as fs from "fs";

/**
 * Load a file and extract the language
 * @param {string} filePath - The path to the file
 * @returns {string} The language of the file
 */
export function loadFile(filePath: string) {
  const content = fs.readFileSync(filePath, "utf8");

  const language = extractLanguage(filePath);

  return { content, language };
}

/**
 * Extract language from file path
 * @param {string} filePath - The file path to extract the language from
 * @returns {string} The language of the file
 */
function extractLanguage(filePath: string): string {
  const pathParts = filePath.split("/");
  const contentIndex = pathParts.findIndex(
    (part: string) => part === "content"
  );

  if (contentIndex !== -1 && contentIndex + 1 < pathParts.length) {
    return pathParts[contentIndex + 1]; // en, es, pt, etc
  }

  // Fallback to 'en' if we can't determine
  return "en";
}
