// import { FeaturedPosts } from "@/features/home/components/featured-posts";
import { LatestArticles } from "./components/latest-articles";
import { IntroSection } from "./components/intro-section";
import { getLatestPosts } from "./utils/fetch";
import { ClientSearch } from "./components/search";
import { getDictionary } from "@/lib/dictionaries";
import { ReadingLists } from "./components/reading-lists";
import { UserSurvey } from "./components/user-survey";

interface HomePageProps {
  lang: string;
}

export async function HomePage(props: HomePageProps) {
  const { lang } = props;

  const dict = await getDictionary(lang);
  const latestPosts = await getLatestPosts(lang);

  return (
    <>
      <IntroSection dictionary={dict} />
      <ClientSearch lang={lang} dictionary={dict} />
      <LatestArticles lang={lang} dictionary={dict} latestPosts={latestPosts} />
      <ReadingLists lang={lang} dictionary={dict} />
      <UserSurvey dictionary={dict} />
      {/* <FeaturedPosts lang={lang} dictionary={dict} /> */}
    </>
  );
}
