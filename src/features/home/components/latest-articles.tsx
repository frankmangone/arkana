import Link from "next/link";
import { FeaturedPostCard } from "@/components/ui/featured-post-card";
import { PostPreview } from "@/lib/posts";
import type { Dictionary } from "@/lib/dictionaries";
import { withLocalePath } from "@/lib/site-config";

interface LatestArticlesProps {
  lang: string;
  dictionary: Dictionary;
  latestPosts: PostPreview[];
}

export async function LatestArticles({
  lang,
  dictionary,
  latestPosts,
}: LatestArticlesProps) {
  return (
    <div className="w-full min-h-[80vh]">
      {/* Gradient overlay for the section above */}
      <div className="w-full h-16 md:h-30 bg-gradient-to-b from-transparent to-background/80" />

      {/* Articles section with full-width background */}
      {/*  bg-gradient-to-b from-black via-black to-[#0A0A0A] */}
      <section className="relative w-full bg-background/80 py-8 z-5">
        <div className="container z-10 mx-auto px-4 py-8 md:px-6 lg:px-8 max-w-8xl">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
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
              href={withLocalePath(lang, "blog")}
              className="inline-block px-12 py-3 text-white transition-colors bg-primary-650 hover:bg-primary-750"
            >
              {dictionary?.blog?.viewAllPosts || "View All Articles"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
