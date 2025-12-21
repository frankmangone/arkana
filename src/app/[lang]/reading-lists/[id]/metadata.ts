import { Metadata } from "next";
import { getReadingList } from "@/lib/reading-lists";
import { generateBaseMetadata } from "@/lib/metadata-utils";

interface ReadingListPageParams {
  lang: string;
  id: string;
}

interface ReadingListPageProps {
  params: Promise<ReadingListPageParams>;
}

export async function generateMetadata({
  params,
}: ReadingListPageProps): Promise<Metadata> {
  const { id, lang } = await params;
  const readingList = getReadingList({ lang, id });

  if (!readingList) {
    return {
      title: "Reading List Not Found",
      description: "The requested reading list could not be found.",
    };
  }

  return generateBaseMetadata({
    lang,
    path: `reading-lists/${id}`,
    title: `Arkana | ${readingList.title}`,
    description: readingList.description,
    ogTitle: readingList.title,
    image: readingList.coverImage,
    type: "website",
  });
}

