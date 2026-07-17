import { Metadata } from "next";
import { languages } from "@/lib/i18n-config";
import { generateBaseMetadata } from "@/lib/metadata-utils";
import { getTagDisplayName } from "@/lib/tags";
import { getTagsForLanguage } from "./static-params";

interface TagPageProps {
  params: Promise<{ lang: string; tag: string }>;
}

export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const { lang, tag } = await params;
  const displayName = getTagDisplayName(tag, lang);

  const availableLanguages: string[] = [];
  for (const language of languages) {
    if ((await getTagsForLanguage(language)).includes(tag)) {
      availableLanguages.push(language);
    }
  }

  return generateBaseMetadata({
    lang,
    path: `blog/tags/${tag}`,
    title: `Arkana | ${displayName}`,
    description: `Articles about ${displayName} on Arkana.`,
    ogTitle: displayName,
    type: "website",
    availableLanguages,
  });
}
