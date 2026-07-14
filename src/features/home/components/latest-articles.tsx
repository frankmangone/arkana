import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
    <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24 lg:px-8">
      <div className="mb-10 flex items-end justify-between border-b border-rule pb-5">
        <div>
          <p className="eyebrow mb-2 text-primary-800">
            {dictionary?.home?.recentPosts?.title || "Recent blog posts"}
          </p>
          <p className="text-ink-muted">
            {dictionary?.home?.recentPosts?.description ||
              "Explore the latest insights and tutorials from our team"}
          </p>
        </div>
        <Link
          href={withLocalePath(lang, "blog")}
          className="hidden shrink-0 items-center gap-1.5 text-sm font-medium text-primary-800 transition-colors hover:text-primary-900 sm:inline-flex"
        >
          {dictionary?.blog?.viewAllPosts || "View All Articles"}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Featured posts grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Main featured post (left side) */}
        <FeaturedPostCard post={latestPosts[0]} lang={lang} variant="large" />

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

      <div className="mt-10 text-center sm:hidden">
        <Link
          href={withLocalePath(lang, "blog")}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-800 transition-colors hover:text-primary-900"
        >
          {dictionary?.blog?.viewAllPosts || "View All Articles"}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
