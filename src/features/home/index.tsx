// import { FeaturedPosts } from "@/features/home/components/featured-posts";
import { LatestArticles } from "./components/latest-articles";
import { IntroSection } from "./components/intro-section";
import { getLatestPosts } from "./utils/fetch";
import { store } from "./store";
import { ClientSearch } from "./components/search";

interface HomePageProps {
  lang: string;
}

export async function HomePage(props: HomePageProps) {
  const { lang } = props;

  await store.initialize(lang);
  const dict = store.getDictionary();

  const latestPosts = await getLatestPosts(lang);
  store.set("latestPosts", latestPosts);

  return (
    <>
      <IntroSection />
      <ClientSearch lang={lang} dictionary={dict} />
      <LatestArticles />
      {/* <FeaturedPosts lang={lang} dictionary={dict} /> */}
    </>
  );
}
