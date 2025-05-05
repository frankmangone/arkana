import fs from "fs/promises";
import path from "path";
import { Metadata } from "next";
import { MainLayout } from "@/components/layouts/main-layout";
import { BlogPage } from "@/features/blog/list";
import { getDictionary } from "@/lib/dictionaries";
import { getAllPosts } from "@/lib/posts";

interface BlogPageParams {
  lang: string;
}

interface BlogPageProps {
  params: Promise<BlogPageParams>;
  // searchParams: { tag?: string } & Promise<any>;
}

export const metadata: Metadata = {
  title: "Mindō | All Posts",
  description: "Articles on mathematics, computer science, and cryptography",
};

export async function generateStaticParams() {
  const contentPath = path.join(process.cwd(), "src", "content");

  try {
    const languages = await fs.readdir(contentPath);
    return languages
      .filter(async (lang) => {
        const langPath = path.join(contentPath, lang);
        const langStat = await fs.stat(langPath);
        return langStat.isDirectory();
      })
      .map((lang) => ({
        lang,
      }));
  } catch (error) {
    console.error("Error generating params:", error);
    return [{ lang: "en" }];
  }
}

export default async function Page({ params }: BlogPageProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const allPosts = await getAllPosts(lang);
  // const selectedTag = searchParams?.tag || null;

  return (
    <MainLayout lang={lang}>
      <BlogPage
        lang={lang}
        posts={allPosts}
        dictionary={dict}
        // selectedTag={selectedTag}
      />
    </MainLayout>
  );
}
