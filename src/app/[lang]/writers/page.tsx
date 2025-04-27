import fs from "fs/promises";
import path from "path";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { writers } from "@/lib/writers";
import { MainLayout } from "@/components/layouts/main-layout";
import { WritersPage } from "@/features/writers/list";
import { getDictionary } from "@/lib/dictionaries";

interface WritersPageParams {
  lang: string;
}

interface WritersPageProps {
  params: Promise<WritersPageParams>;
}

export const metadata: Metadata = {
  title: "Writers",
  description: "Meet the people behind the content",
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

export default async function Page({ params }: WritersPageProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  // Convert the writers object into an array
  const writersList = Object.values(writers);

  if (!writersList || writersList.length === 0) {
    return notFound();
  }

  return (
    <MainLayout lang={lang}>
      <WritersPage lang={lang} dictionary={dict} writers={writersList} />
    </MainLayout>
  );
}
