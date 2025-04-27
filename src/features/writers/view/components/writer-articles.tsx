import Link from "next/link";
import { PostPreview } from "@/lib/posts";

interface WriterArticlesProps {
  lang: string;
  articles: PostPreview[];
  writerName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dictionary: any;
}

export function WriterArticles({
  lang,
  articles,
  writerName,
  dictionary,
}: WriterArticlesProps) {
  if (articles.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{dictionary.writers.noArticles}</p>
      </div>
    );
  }

  return (
    <section>
      <h2 className="text-3xl font-bold mb-8">
        {dictionary.writers.articlesBy.replace("{name}", writerName)}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <div
            key={article.slug}
            className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow p-6"
          >
            <p className="text-sm text-gray-500 mb-2">
              {new Date(article.date).toLocaleDateString()} •{" "}
              {article.readingTime}
            </p>
            <h3 className="text-xl font-semibold mb-2">
              <Link
                href={`/${lang}/blog/${article.slug}`}
                className="hover:text-blue-500 transition-colors"
              >
                {article.title}
              </Link>
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
              {article.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
