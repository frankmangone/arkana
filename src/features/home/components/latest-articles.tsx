import Link from "next/link";
import { PostCard } from "@/components/post-card";
import { PostPreview } from "@/lib/posts";

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
  return (
    <section className="container mx-auto px-4 mt-8">
      <h2 className="text-3xl font-bold mb-8">
        {dictionary?.blog?.title || "Latest Articles"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {latestPosts.map((post) => (
          <PostCard key={post.slug} article={post} lang={lang} />
        ))}
      </div>

      <div className="text-center mt-8">
        <Link
          href={`/${lang}/blog`}
          style={{
            borderColor: "var(--primary-500)",
            color: "var(--primary-500)",
          }}
          className="inline-block px-6 py-3 border-2 rounded-lg transition-colors hover:bg-[rgba(167,119,255,0.3)]"
        >
          {dictionary?.blog?.viewAllPosts || "View All Articles"}
        </Link>
      </div>
    </section>
  );
}
