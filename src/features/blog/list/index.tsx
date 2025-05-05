import Link from "next/link";
import { PostPreview } from "@/lib/posts";
import { PostCard } from "@/components/post-card";

interface BlogPageProps {
  lang: string;
  posts: PostPreview[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dictionary: any;
  selectedTag?: string | null;
}

export function BlogPage({
  lang,
  posts,
  dictionary,
  selectedTag,
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
      <h1 className="text-4xl font-bold mb-8">{dictionary.blog.title}</h1>

      {/* Tag filter */}
      {/* <div className="mb-8">
        <h2 className="text-lg mb-3">{dictionary.blog.filterByTag}</h2>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/${lang}/blog`}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              !selectedTag
                ? "text-white"
                : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
            style={
              !selectedTag ? { backgroundColor: "var(--primary-500)" } : {}
            }
          >
            {dictionary.blog.allPosts}
          </Link>

          {allTags.map((tag) => (
            <Link
              key={tag}
              href={`/${lang}/blog?tag=${encodeURIComponent(tag)}`}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedTag === tag
                  ? "text-white"
                  : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
              style={
                selectedTag === tag
                  ? { backgroundColor: "var(--primary-500)" }
                  : {}
              }
            >
              {tag}
            </Link>
          ))}
        </div>
      </div> */}

      {/* Post grid */}
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <PostCard key={post.slug} article={post} lang={lang} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-2">
            {dictionary.blog.noPosts}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {dictionary.blog.tryDifferentTag}
          </p>
          <Link
            href={`/${lang}/blog`}
            style={{
              borderColor: "var(--primary-500)",
              color: "var(--primary-500)",
            }}
            className="inline-block px-6 py-3 border-2 rounded-lg transition-colors hover:bg-primary-100"
          >
            {dictionary.blog.viewAllPosts}
          </Link>
        </div>
      )}
    </div>
  );
}
