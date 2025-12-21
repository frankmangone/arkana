import { Metadata } from "next";
import { getDictionary } from "@/lib/dictionaries";
import { generateBaseMetadata } from "@/lib/metadata-utils";

interface WritersPageParams {
  lang: string;
}

interface WritersPageProps {
  params: Promise<WritersPageParams>;
}

export async function generateMetadata({
  params,
}: WritersPageProps): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return generateBaseMetadata({
    lang,
    path: "writers",
    title: `Arkana | ${dict.writers.title}`,
    description: dict.writers.description,
    ogTitle: dict.writers.title,
    type: "website",
  });
}

