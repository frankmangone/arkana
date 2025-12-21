import { getAllReadingLists } from "@/lib/reading-lists";
import { languages } from "@/lib/i18n-config";

export async function generateStaticParams() {
  const paths = [];

  // Generate params only for reading lists that actually exist in each language
  for (const lang of languages) {
    try {
      const localizedReadingLists = getAllReadingLists(lang);

      // Only generate paths for reading lists that exist in this language
      for (const list of localizedReadingLists) {
        paths.push({
          id: list.id,
          lang,
        });
      }
    } catch (error) {
      console.error(`Error getting reading lists for language ${lang}:`, error);
      // Continue with other languages even if one fails
    }
  }

  return paths;
}

