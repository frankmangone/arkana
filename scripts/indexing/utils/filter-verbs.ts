import { spawn } from "child_process";
import path from "path";

/**
 * Filter out verbs from text using Python spacy (which is much better than the JS version)
 * @param {string} text - The text to filter
 * @param {string} language - Language code ('en', 'es', 'pt')
 * @returns {Promise<string[]>} - Filtered words without verbs
 */
export async function filterVerbsPython(
  text: string,
  language: string
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    // Path to the Python script
    const scriptPath = path.join(__dirname, "filter_verbs.py");

    // Spawn Python process
    const python = spawn("python3", [scriptPath, text, language]);

    let result = "";
    let error = "";

    // Collect stdout data
    python.stdout.on("data", (data) => {
      result += data.toString();
    });

    // Collect stderr data
    python.stderr.on("data", (data) => {
      error += data.toString();
    });

    // Handle process completion
    python.on("close", (code) => {
      if (code === 0) {
        try {
          const filteredWords = JSON.parse(result);
          resolve(filteredWords);
        } catch (parseError) {
          reject(new Error(`Failed to parse Python output: ${parseError}`));
        }
      } else {
        reject(new Error(`Python process failed with code ${code}: ${error}`));
      }
    });

    // Handle process errors
    python.on("error", (err) => {
      reject(new Error(`Failed to start Python process: ${err.message}`));
    });
  });
}

/**
 * Fallback function if Python is not available
 * @param {string[]} words - Array of words to filter
 * @param {string} language - Language code
 * @returns {string[]} - Filtered words using simple rules
 */
export function filterVerbsFallback(
  words: string[],
  language: string
): string[] {
  // Simple verb pattern matching as fallback
  const verbPatterns = {
    en: [/ing$/, /ed$/, /s$/, /es$/, /er$/, /est$/],
    es: [/ar$/, /er$/, /ir$/, /ando$/, /iendo$/, /ado$/, /ido$/],
    pt: [/ar$/, /er$/, /ir$/, /ando$/, /endo$/, /ado$/, /ido$/],
  };

  const patterns =
    verbPatterns[language as keyof typeof verbPatterns] || verbPatterns.en;

  return words.filter(
    (word) => !patterns.some((pattern) => pattern.test(word))
  );
}
