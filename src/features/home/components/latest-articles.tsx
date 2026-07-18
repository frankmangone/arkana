import { FeaturedPostCard } from "@/components/ui/featured-post-card";
import { PostPreview } from "@/lib/posts";

interface LatestArticlesProps {
  lang: string;
  latestPosts: PostPreview[];
}

export async function LatestArticles({ lang, latestPosts }: LatestArticlesProps) {
  const [featured, ...rest] = latestPosts;

  return (
    <section className="mx-auto max-w-6xl px-4 pt-8 md:px-6 md:pt-10 lg:px-8">
      {/* Featured post, full width */}
      {featured && (
        <div className="mb-10">
          <FeaturedPostCard post={featured} lang={lang} variant="large" />
        </div>
      )}

      {/* Remaining posts, two columns */}
      <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2">
        {rest.map((post) => (
          <FeaturedPostCard key={post.slug} post={post} lang={lang} />
        ))}
      </div>
    </section>
  );
}
