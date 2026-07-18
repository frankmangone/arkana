import { Breadcrumbs } from "@/components/breadcrumbs";
import { PostPreview } from "@/lib/posts";
import { BlogGrid } from "./components/blog-grid";
import type { Dictionary } from "@/lib/dictionaries";

interface BlogPageProps {
  lang: string;
  posts: PostPreview[];
  allPosts: PostPreview[];
  dictionary: Dictionary;
  /** Index into `allPosts` where `posts` starts — infinite scroll continues
   * forward from there. */
  startIndex?: number;
}

export function BlogPage({
  lang,
  posts,
  allPosts,
  dictionary,
  startIndex = 0,
}: BlogPageProps) {
  return (
    <div className="container pb-8">
      <header className="mb-12 pb-4 pt-8">
        <Breadcrumbs
          lang={lang}
          items={[{ label: dictionary.blog.title }]}
          className="mb-12"
        />
        <p className="eyebrow mb-4 font-semibold text-ink-faint">
          {dictionary.home.recentPosts.title}
        </p>
        <h1 className="display-title !text-[clamp(2.75rem,6vw,4.75rem)] text-primary-750">
          {dictionary.blog.title}
        </h1>
      </header>

      <BlogGrid
        lang={lang}
        allPosts={allPosts}
        pagePosts={posts}
        startIndex={startIndex}
        labels={{
          searchPlaceholder: dictionary.search.placeholder,
          searchTags: dictionary.blog.searchTags,
          noTagsFound: dictionary.blog.noTagsFound,
          searching: dictionary.search.searching,
          noPosts: dictionary.blog.noPosts,
          noPostsDescription: dictionary.blog.noPostsDescription,
          clearSearch: dictionary.blog.clearSearch,
          endOfFeed: dictionary.common.endOfFeed,
        }}
      />
    </div>
  );
}
