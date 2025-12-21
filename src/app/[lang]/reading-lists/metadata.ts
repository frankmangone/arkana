import { Metadata } from "next";
import { getDictionary } from "@/lib/dictionaries";
import { generateBaseMetadata } from "@/lib/metadata-utils";

interface ReadingListsPageParams {
  lang: string;
}

interface ReadingListsPageProps {
  params: Promise<ReadingListsPageParams>;
}

export async function generateMetadata({
  params,
}: ReadingListsPageProps): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return generateBaseMetadata({
    lang,
    path: "reading-lists",
    title: `Arkana | ${dict.readingLists.list.title}`,
    description: dict.readingLists.list.description,
    ogTitle: dict.readingLists.list.title,
    type: "website",
  });
}

