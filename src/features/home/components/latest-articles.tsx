import Link from "next/link";
import { PostPreview } from "..";

interface LatestArticlesProps {
  lang: string;
  latestPosts: PostPreview[];
}

export function LatestArticles({ lang, latestPosts }: LatestArticlesProps) {
  return (
    <section className="container mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold mb-8">Latest Articles</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {latestPosts.map((post) => (
          <div
            key={post.slug}
            className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-2">
                {new Date(post.date).toLocaleDateString()} • {post.readingTime}
              </p>
              <h3 className="text-xl font-semibold mb-2">
                <Link
                  href={`/${lang}/blog/${post.slug}`}
                  className="hover:underline"
                >
                  {post.title}
                </Link>
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {post.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-8">
        <Link
          href={`/${lang}/blog`}
          className="inline-block px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <span className="text-white">View All Articles</span>
        </Link>
      </div>
    </section>
  );
}
