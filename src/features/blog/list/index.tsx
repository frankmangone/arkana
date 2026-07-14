import Link from "next/link";
import { PostPreview } from "@/lib/posts";
import { PostCard } from "@/components/ui/post-card";
import { Pagination } from "@/components/pagination";
import { withLocalePath } from "@/lib/site-config";
import type { Dictionary } from "@/lib/dictionaries";

interface BlogPageProps {
  lang: string;
  posts: PostPreview[];
  dictionary: Dictionary;
  selectedTag?: string | null;
  currentPage?: number;
  totalPages?: number;
}

export function BlogPage({
  lang,
  posts,
  dictionary,
  selectedTag,
  currentPage = 1,
  totalPages = 1,
}: BlogPageProps) {
  // Get all unique tags from posts
  //   const allTags = Array.from(
  //     new Set(posts.flatMap((post) => post.tags))
  //   ).sort();

  // Filter posts by selected tag if any
  const filteredPosts = selectedTag
    ? posts.filter((post) => post.tags.includes(selectedTag))
    : posts;

  return (
    <div className="container py-8">
      <header className="mb-10 border-b border-rule pb-6">
        <p className="eyebrow mb-3 text-primary-800">
          {dictionary.home.recentPosts.title}
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-ink-heading md:text-5xl">
          {dictionary.blog.title}
        </h1>
      </header>

      {/* Post grid */}
      {filteredPosts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <PostCard key={post.slug} post={post} lang={lang} />
            ))}
          </div>

          {/* Only show pagination if we have more than one page */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath={`/${lang}/blog`}
            />
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-ink-heading mb-2">
            {dictionary.blog.noPosts}
          </h3>
          <p className="text-ink-muted mb-6">
            {dictionary.blog.tryDifferentTag}
          </p>
          <Link
            href={withLocalePath(lang, "blog")}
            className="inline-block rounded-[4px] border border-rule-strong px-6 py-3 text-ink-body transition-colors hover:border-primary-700 hover:text-ink-heading"
          >
            {dictionary.blog.viewAllPosts}
          </Link>
        </div>
      )}
    </div>
  );
}
