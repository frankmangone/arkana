import { LatestArticles } from "./components/latest-articles";
import { IntroSection } from "./components/intro-section";
import { getLatestPosts } from "./utils/fetch";
import { getDictionary } from "@/lib/dictionaries";

interface HomePageProps {
  lang: string;
}

export async function HomePage(props: HomePageProps) {
  const { lang } = props;

  const dict = await getDictionary(lang);
  const latestPosts = await getLatestPosts(lang, 13);

  return (
    <>
      <IntroSection lang={lang} dictionary={dict} />
      <LatestArticles lang={lang} latestPosts={latestPosts} />
    </>
  );
}
