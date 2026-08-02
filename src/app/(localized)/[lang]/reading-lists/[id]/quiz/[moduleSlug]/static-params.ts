import { getAllReadingLists } from "@/lib/reading-lists";
import { languages } from "@/lib/i18n-config";

interface PageParams {
  lang: string;
  id: string;
  moduleSlug: string;
}

// This function is required for static export
export async function generateStaticParams(): Promise<PageParams[]> {
  const params: PageParams[] = [];

  for (const lang of languages) {
    const readingLists = getAllReadingLists(lang);
    for (const readingList of readingLists) {
      for (const readingListModule of readingList.modules) {
        params.push({
          lang,
          id: readingList.slug,
          moduleSlug: readingListModule.slug,
        });
      }
    }
  }

  return params;
}
