import { FeaturedPostCard } from "@/components/ui/featured-post-card";
import { type MasonryBreakpoint } from "@/components/ui/masonry-columns";
import { InfiniteMasonryFeed } from "@/components/ui/infinite-masonry-feed";
import { PostPreview } from "@/lib/posts";

interface LatestArticlesProps {
  lang: string;
  /** Full post archive, newest first. */
  allPosts: PostPreview[];
}

// A 4th column only kicks in on genuinely wide monitors (2xl) — narrower than
// that, four columns would squeeze these text-heavy cards too much.
const HOME_GRID_BREAKPOINTS: MasonryBreakpoint[] = [
  { minWidth: 1536, columns: 4 },
  { minWidth: 1024, columns: 3 },
  { minWidth: 768, columns: 2 },
  { minWidth: 0, columns: 1 },
];

export function LatestArticles({ lang, allPosts }: LatestArticlesProps) {
  const [featured, ...rest] = allPosts;

  return (
    <section className="pt-8 md:pt-10">
      {/* Featured post, full width */}
      {featured && (
        <div className="mx-auto mb-10 max-w-6xl px-4 md:px-6 lg:px-8">
          <FeaturedPostCard post={featured} lang={lang} variant="large" />
        </div>
      )}

      {/* Remaining posts, three masonry columns — reading order still goes
          left-to-right, top-to-bottom, but each column's height is its own,
          so columns fall out of phase with one another. Infinite-scrolls
          through the rest of the archive 12 posts at a time. */}
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 2xl:max-w-[96rem]">
        <InfiniteMasonryFeed
          posts={rest}
          lang={lang}
          breakpoints={HOME_GRID_BREAKPOINTS}
        />
      </div>
    </section>
  );
}
