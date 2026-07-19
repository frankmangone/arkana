import { Metadata } from "next";
import { getDictionary } from "@/lib/dictionaries";
import { generateBaseMetadata } from "@/lib/metadata-utils";

interface BlogIndexProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({
  params,
}: BlogIndexProps): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return generateBaseMetadata({
    lang,
    path: "blog",
    title: `Arkana | ${dict.blog.title}`,
    description: dict.home.recentPosts.description,
    ogTitle: dict.blog.title,
    type: "website",
  });
}
