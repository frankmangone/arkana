import { Metadata } from "next";
import { PageProps } from "./page";
import { getDictionary } from "@/lib/dictionaries";
import { generateBaseMetadata } from "@/lib/metadata-utils";

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return generateBaseMetadata({
    lang,
    path: "",
    title: "Arkana",
    description: dict.home.intro.descriptionBig,
    type: "website",
  });
}

