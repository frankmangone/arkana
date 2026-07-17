import { readingLists as enReadingLists } from "@/lib/reading-lists/en";
import { readingLists as esReadingLists } from "@/lib/reading-lists/es";
import { readingLists as ptReadingLists } from "@/lib/reading-lists/pt";

interface PageParams {
  lang: string;
  id: string;
  post: string;
}

// This function is required for static export
export async function generateStaticParams(): Promise<PageParams[]> {
  const params: PageParams[] = [];

  // Define supported languages and their reading lists
  const languageReadingLists = {
    en: enReadingLists,
    es: esReadingLists,
    pt: ptReadingLists,
  };

  // Generate params for each language and reading list
  for (const [lang, readingLists] of Object.entries(languageReadingLists)) {
    for (const readingList of readingLists) {
      for (const item of readingList.items) {
        params.push({
          lang,
          id: readingList.id,
          post: item.id,
        });
      }
    }
  }

  return params;
}
