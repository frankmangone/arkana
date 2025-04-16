import { AboutMe } from "@/features/home/components/about-me";
// import { FeaturedPosts } from "@/features/home/components/featured-posts";
import { getDictionary } from "@/lib/dictionaries";

interface HomePageProps {
  lang: string;
}

export async function HomePage(props: HomePageProps) {
  const { lang } = props;

  const dict = await getDictionary(lang);

  return (
    <div className="container py-8 space-y-12">
      <AboutMe lang={lang} dictionary={dict} />
      {/* <FeaturedPosts lang={lang} dictionary={dict} /> */}
    </div>
  );
}
