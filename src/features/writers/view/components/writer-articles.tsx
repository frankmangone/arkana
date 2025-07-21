import { PostPreview } from "@/lib/posts";
import { PostCard } from "@/components/custom/post-card";

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
          <PostCard key={article.slug} post={article} lang={lang} />
        ))}
      </div>
    </section>
  );
}
