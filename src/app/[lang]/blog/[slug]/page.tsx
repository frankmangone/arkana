import { getPostBySlug } from "@/features/posts/actions";
import { PostPage } from "@/features/posts";
import { Metadata } from "next";
import fs from "fs/promises";
import path from "path";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface PageParams extends Promise<any> {
  lang: string;
  slug: string;
}

interface PageProps {
  params: PageParams;
}

// This function is required for static export
export async function generateStaticParams() {
  // Get all available languages by reading directories
  const contentPath = path.join(process.cwd(), "src", "content");
  const languages = await fs.readdir(contentPath);

  const params = [];

  // For each language, get all markdown files
  for (const lang of languages) {
    try {
      const langPath = path.join(contentPath, lang);
      const langStat = await fs.stat(langPath);

      // Skip if not a directory
      if (!langStat.isDirectory()) continue;

      const files = await fs.readdir(langPath);

      // Get all markdown files and extract their slugs
      const slugs = files
        .filter((file) => file.endsWith(".md"))
        .map((file) => file.replace(".md", ""));

      // Create params for each language-slug combination
      for (const slug of slugs) {
        params.push({
          lang,
          slug,
        });
      }
    } catch (error) {
      console.error(`Error processing language directory ${lang}:`, error);
    }
  }

  return params;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug, lang } = await params;
  const post = await getPostBySlug(slug, lang);

  if (!post) {
    return {
      title: "Post Not Found",
      description: "The requested post could not be found.",
    };
  }

  return {
    title: post.metadata.title,
    description: post.metadata.description,
    authors: [{ name: post.metadata.author }],
    keywords: post.metadata.tags,
  };
}

export default async function Page({ params }: PageProps) {
  const { lang, slug } = params;
  return <PostPage lang={lang} slug={slug} />;
}
