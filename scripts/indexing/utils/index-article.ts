import { parseMarkdown } from "./parse-markdown";
import { tokenizeAndFilter } from "./tokenize-and-filter";
import { countWords } from "./count-words";
import { loadFile } from "./load-file";

/**
 * Process an article and extract clean, filtered words
 * @param {string} filePath - The path to the file
 */
export async function indexArticle(filePath: string) {
  console.log("Indexing article:", filePath);

  const { content, language } = loadFile(filePath);

  const { cleanText, title } = parseMarkdown(content);

  console.log("Processing article:", title);
  console.log("Language:", language);

  const filteredWords = await tokenizeAndFilter(cleanText, language);
  const wordFrequencies = countWords(filteredWords);

  // console.log("Clean text:", cleanText);
  console.log("Word frequencies:", wordFrequencies.slice(0, 100));
  console.log("Word frequencies:", wordFrequencies.slice(100, 200));
  console.log("Word frequencies:", wordFrequencies.slice(200, 300));

  //   return {
  //     title: article.title,
  //     language: article.language,
  //     cleanText,
  //     filteredWords,
  //     wordFrequencies,
  //   };
}
