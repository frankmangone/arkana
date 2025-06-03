import Link from "next/link";
import { ArticleListItem } from "@/lib/supabase";

interface SearchResultCardProps {
  article: ArticleListItem;
  lang: string;
}

export function SearchResultCard({ article, lang }: SearchResultCardProps) {
  return (
    <Link
      href={`/${lang}/blog/${article.slug}`}
      className="group block bg-gray-900 hover:bg-gray-800 transition-colors"
    >
      <div className="p-4">
        {/* Image placeholder */}
        <div className="relative h-24 mb-3 bg-gray-700 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-gray-800 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-white group-hover:text-primary-400 transition-colors line-clamp-2 leading-tight">
            {article.title}
          </h3>

          <div className="pt-1">
            <span className="text-primary-500 text-xs font-medium group-hover:text-primary-400 transition-colors">
              Read more →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
