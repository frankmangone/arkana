import { LatestArticles } from "./components/latest-articles";
import { IntroSection } from "./components/intro-section";
import { getAllPosts } from "@/lib/posts";
import { getDictionary } from "@/lib/dictionaries";

interface HomePageProps {
  lang: string;
}

export async function HomePage(props: HomePageProps) {
  const { lang } = props;

  const dict = await getDictionary(lang);
  const allPosts = await getAllPosts(lang);

  return (
    <>
      <IntroSection lang={lang} dictionary={dict} />
      <LatestArticles lang={lang} allPosts={allPosts} dictionary={dict} />
    </>
  );
}
