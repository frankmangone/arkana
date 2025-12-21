import { Metadata } from "next";
import { getDictionary } from "@/lib/dictionaries";
import { generateBaseMetadata } from "@/lib/metadata-utils";

interface BlogPageParams {
  lang: string;
  page: string;
}

interface BlogPageProps {
  params: Promise<BlogPageParams>;
}

export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const { lang, page } = await params;
  const dict = await getDictionary(lang);
  const pageNumber = parseInt(page, 10);

  const title =
    pageNumber > 1
      ? `Arkana | ${dict.blog.title} - Page ${pageNumber}`
      : `Arkana | ${dict.blog.title}`;
  const description = dict.home.recentPosts.description;

  return generateBaseMetadata({
    lang,
    path: `blog/page/${page}`,
    title,
    description,
    ogTitle: dict.blog.title,
    type: "website",
  });
}

