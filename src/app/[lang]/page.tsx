import { HomePage } from "@/features/home";
import fs from "fs/promises";
import path from "path";
import { MainLayout } from "@/components/layouts/main-layout";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface HomeParams extends Promise<any> {
  lang: string;
}

interface HomeProps {
  params: HomeParams;
}

// Add generateStaticParams function for static export
export async function generateStaticParams() {
  // Get all available languages by reading directories
  const contentPath = path.join(process.cwd(), "src", "content");

  try {
    // Get all language directories
    const languages = await fs.readdir(contentPath);

    // Create params for each language
    return languages
      .filter(async (lang) => {
        // Check if it's a directory
        const langPath = path.join(contentPath, lang);
        const langStat = await fs.stat(langPath);
        return langStat.isDirectory();
      })
      .map((lang) => ({
        lang,
      }));
  } catch (error) {
    console.error("Error generating static params for home page:", error);
    // Provide a fallback if there's an error
    return [{ lang: "en" }];
  }
}

export default async function Home(props: HomeProps) {
  const { lang } = await props.params;

  return (
    <MainLayout lang={lang}>
      <HomePage lang={lang} />
    </MainLayout>
  );
}
