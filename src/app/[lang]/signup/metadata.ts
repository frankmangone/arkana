import { Metadata } from "next";
import { getDictionary } from "@/lib/dictionaries";
import { generateBaseMetadata } from "@/lib/metadata-utils";

interface SignupPageParams {
  lang: string;
}

interface SignupPageProps {
  params: Promise<SignupPageParams>;
}

export async function generateMetadata({
  params,
}: SignupPageProps): Promise<Metadata> {
  // If auth is not enabled, return basic metadata (page won't be built anyway)
  if (process.env.NEXT_PUBLIC_AUTH_ENABLED !== 'true') {
    return {
      title: 'Arkana | Page Not Found',
    };
  }

  const { lang } = await params;
  const dict = await getDictionary(lang);

  return generateBaseMetadata({
    lang,
    path: "signup",
    title: `Arkana | ${dict.auth.signup.title}`,
    description: dict.auth.signup.description,
    ogTitle: dict.auth.signup.title,
    type: "website",
  });
}
