import { HomePage } from "@/features/home";
import fs from "fs/promises";
import path from "path";
import { HomeLayout } from "@/components/layouts/home-layout";

interface HomeParams {
  lang: string;
}

interface HomeProps {
  params: Promise<HomeParams>;
}

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
    console.error("Error generating static params for home page:", error);

    // Fallback language is english
    return [{ lang: "en" }];
  }
}

export default async function Home(props: HomeProps) {
  const { lang } = await props.params;

  return (
    <HomeLayout lang={lang}>
      <HomePage lang={lang} />
    </HomeLayout>
  );
}
