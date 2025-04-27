import { PostPreview } from "@/features/home";
import Link from "next/link";

interface PostCardProps {
  article: PostPreview;
  lang: string;
}

export function PostCard({ article, lang }: PostCardProps) {
  return (
    <div
      key={article.slug}
      className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow p-6"
    >
      <p className="text-sm text-gray-500 mb-2">
        {new Date(article.date).toLocaleDateString()} • {article.readingTime}
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
  );
}
