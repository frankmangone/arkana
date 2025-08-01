import { PageParams } from "./page";
import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";

export async function generateStaticParams() {
  const contentPath = path.join(process.cwd(), "src", "content");
  const params: PageParams[] = [];
  // Define supported languages
  const supportedLanguages = ["en", "es", "pt"];
  // Track unique folder/slug combinations across all languages
  const uniqueArticles: { folder: string; slug: string }[] = [];

  try {
    // Get all language directories
    const languages = await fs.readdir(contentPath);

    // First, collect all unique article paths across all languages
    for (const lang of languages) {
      const langPath = path.join(contentPath, lang);
      const langStat = await fs.stat(langPath);

      // Skip if not a directory
      if (!langStat.isDirectory()) continue;

      // Get all folders in language directory
      const folders = await fs.readdir(langPath);

      for (const folder of folders) {
        const folderPath = path.join(langPath, folder);
        const folderStat = await fs.stat(folderPath);

        // Skip if not a directory
        if (!folderStat.isDirectory()) continue;

        // Get all markdown files in the folder
        const files = await fs.readdir(folderPath);

        for (const file of files) {
          if (file.endsWith(".md")) {
            const slug = file.replace(".md", "");

            // Check if the article is visible before adding it
            const filePath = path.join(folderPath, file);
            const fileContent = await fs.readFile(filePath, "utf8");
            const { data } = matter(fileContent);

            // Skip articles with visible: false
            if (data.visible === false) {
              continue;
            }

            // Check if this folder/slug combination is already tracked
            const existingIndex = uniqueArticles.findIndex(
              (article) => article.folder === folder && article.slug === slug
            );

            if (existingIndex === -1) {
              uniqueArticles.push({ folder, slug });
            }
          }
        }
      }
    }

    // Now generate params for all supported languages and all unique articles
    for (const lang of supportedLanguages) {
      for (const article of uniqueArticles) {
        params.push({
          lang,
          folder: article.folder,
          slug: article.slug,
        });
      }
    }
  } catch (error) {
    console.error(`Error processing directories:`, error);
  }

  return params;
}
