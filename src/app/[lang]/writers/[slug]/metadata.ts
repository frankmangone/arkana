import { Metadata } from "next";
import { writers } from "@/lib/writers";
import { getDictionary } from "@/lib/dictionaries";
import { generateBaseMetadata } from "@/lib/metadata-utils";

interface WriterPageParams {
  lang: string;
  slug: string;
}

interface WriterPageProps {
  params: Promise<WriterPageParams>;
}

export async function generateMetadata({
  params,
}: WriterPageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  const dict = await getDictionary(lang);
  const writer = writers[slug];

  if (!writer) {
    return {
      title: "Writer Not Found",
      description: "The requested writer could not be found.",
    };
  }

  const writerName = writer.name;
  const description = dict.writers.articlesBy.replace("{name}", writerName);

  return generateBaseMetadata({
    lang,
    path: `writers/${slug}`,
    title: `Arkana | ${writerName}`,
    description,
    ogTitle: writerName,
    type: "website",
  });
}

