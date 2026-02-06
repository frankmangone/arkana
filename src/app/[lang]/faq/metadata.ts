import { Metadata } from "next";
import { getDictionary } from "@/lib/dictionaries";
import { generateBaseMetadata } from "@/lib/metadata-utils";

interface FAQPageParams {
  lang: string;
}

interface FAQPageProps {
  params: Promise<FAQPageParams>;
}

export async function generateMetadata({
  params,
}: FAQPageProps): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return generateBaseMetadata({
    lang,
    path: "faq",
    title: `Arkana | ${dict.faq.title || "FAQ"}`,
    description: dict.faq.wallet.answer || "Frequently asked questions about Arkana",
    ogTitle: dict.faq.title || "FAQ",
    type: "website",
  });
}
