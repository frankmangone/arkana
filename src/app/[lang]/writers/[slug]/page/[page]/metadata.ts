import { Metadata } from "next";
import { getWriter } from "@/lib/writers";
import { getDictionary } from "@/lib/dictionaries";
import { generateBaseMetadata } from "@/lib/metadata-utils";

interface WriterPageParams {
  lang: string;
  slug: string;
  page: string;
}

interface WriterPageProps {
  params: Promise<WriterPageParams>;
}

export async function generateMetadata({
  params,
}: WriterPageProps): Promise<Metadata> {
  const { lang, slug, page } = await params;
  const writer = await getWriter(slug);
  const dict = await getDictionary(lang);

  if (!writer) {
    return {
      title: "Writer Not Found",
      description: "The requested writer could not be found.",
    };
  }

  const writerName = writer.name;
  const pageNumber = parseInt(page, 10);
  const description = dict.writers.articlesBy.replace("{name}", writerName);
  const title =
    pageNumber > 1
      ? `Arkana | ${writerName} - Page ${pageNumber}`
      : `Arkana | ${writerName}`;

  return generateBaseMetadata({
    lang,
    path: `writers/${slug}/page/${page}`,
    title,
    description,
    ogTitle: writerName,
    type: "website",
  });
}

