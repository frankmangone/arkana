import { getAllReadingLists } from "@/lib/reading-lists";
import { languages } from "@/lib/i18n-config";

interface PageParams {
  lang: string;
  id: string;
  post: string;
}

// This function is required for static export
export async function generateStaticParams(): Promise<PageParams[]> {
  const params: PageParams[] = [];

  for (const lang of languages) {
    const readingLists = getAllReadingLists(lang);
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
