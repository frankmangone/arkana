// import { FeaturedPosts } from "@/features/home/components/featured-posts";
import { LatestArticles } from "./components/latest-articles";
import { IntroSection } from "./components/intro-section";
import { ClientSearch } from "./components/client-search";
import { getStoreDictionary, initializeStore } from "./utils/store";
import { getLatestPosts } from "./utils/fetch";

interface HomePageProps {
  lang: string;
}

export async function HomePage(props: HomePageProps) {
  const { lang } = props;

  await initializeStore(lang);
  const dict = await getStoreDictionary();

  // Get latest posts for this language
  const latestPosts = await getLatestPosts(lang);

  return (
    <>
      <IntroSection />
      <ClientSearch lang={lang} dictionary={dict} />
      <LatestArticles latestPosts={latestPosts} />
      {/* <FeaturedPosts lang={lang} dictionary={dict} /> */}
    </>
  );
}
