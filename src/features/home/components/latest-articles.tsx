import Link from "next/link";
import { PostPreview } from "@/lib/posts";
import { FeaturedPostCard } from "@/components/featured-post-card";

interface LatestArticlesProps {
  lang: string;
  latestPosts: PostPreview[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dictionary?: any;
}

export function LatestArticles({
  lang,
  latestPosts,
  dictionary,
}: LatestArticlesProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://arkana.blog";

  return (
    <div className="w-full">
      {/* Gradient overlay for the section above */}
      <div className="w-full -mt-[260px] h-60 bg-gradient-to-b from-transparent to-background/80" />

      {/* Articles section with full-width background */}
      {/*  bg-gradient-to-b from-black via-black to-[#0A0A0A] */}
      <section className="relative w-full bg-background/80 py-8 z-5">
        <div className="container z-10 mx-auto px-4 py-8 md:px-6 lg:px-8 max-w-8xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">
              {dictionary?.home?.recentPosts?.title || "Recent blog posts"}
            </h1>
            <p className="text-gray-400">
              {dictionary?.home?.recentPosts?.description ||
                "Explore the latest insights and tutorials from our team"}
            </p>
          </div>

          {/* Featured posts grid */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Main featured post (left side) */}
            <FeaturedPostCard
              post={latestPosts[0]}
              lang={lang}
              variant="large"
            />

            {/* Secondary posts (right side) */}
            <div className="space-y-6">
              {[1, 2, 3].map(
                (index) =>
                  latestPosts[index] && (
                    <FeaturedPostCard
                      key={index}
                      post={latestPosts[index]}
                      lang={lang}
                    />
                  )
              )}
            </div>
          </div>

          <div className="text-center mt-16">
            <Link
              href={`${baseUrl}/${lang}/blog`}
              className="inline-block px-12 py-3 text-white transition-colors bg-primary-500 hover:bg-primary-600"
            >
              {dictionary?.blog?.viewAllPosts || "View All Articles"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
