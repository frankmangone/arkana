import { Metadata } from "next";
import { getDictionary } from "@/lib/dictionaries";
import { generateBaseMetadata } from "@/lib/metadata-utils";

interface LoginPageParams {
  lang: string;
}

interface LoginPageProps {
  params: Promise<LoginPageParams>;
}

export async function generateMetadata({
  params,
}: LoginPageProps): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return generateBaseMetadata({
    lang,
    path: "login",
    title: `Arkana | ${dict.auth.login.title}`,
    description: dict.auth.login.description,
    ogTitle: dict.auth.login.title,
    type: "website",
  });
}
