import { Metadata } from "next";
import { getDictionary } from "@/lib/dictionaries";
import { generateBaseMetadata } from "@/lib/metadata-utils";

interface SurveyPageParams {
  lang: string;
}

interface SurveyPageProps {
  params: Promise<SurveyPageParams>;
}

export async function generateMetadata({
  params,
}: SurveyPageProps): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return generateBaseMetadata({
    lang,
    path: "survey",
    title: `Arkana | ${dict.home.userSurvey.title}`,
    description: dict.home.userSurvey.description,
    ogTitle: dict.home.userSurvey.title,
    type: "website",
  });
}
