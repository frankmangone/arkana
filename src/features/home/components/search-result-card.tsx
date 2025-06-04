import type React from "react";

import Image from "next/image";
import Link from "next/link";
import { /* User, */ ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
// import { formatDate } from "@/lib/date-utils";
import { getTagDisplayName } from "@/lib/tags";

// Assuming ArticleListItem has these fields - adjust as needed
interface ArticleListItem {
  slug: string;
  title: string;
  description?: string;
  // date: string;
  thumbnail?: string;
  tags?: string[];
  author?: string;
}

interface SearchResultCardProps {
  article: ArticleListItem;
  lang: string;
}

export function SearchResultCard({ article, lang }: SearchResultCardProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://arkana.blog";

  // const handleAuthorClick = (e: React.MouseEvent) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   router.push(`${baseUrl}/${lang}/writers/${article.author.slug}`);
  // };

  return (
    <div className="group">
      <Link href={`${baseUrl}/${lang}/blog/${article.slug}`} className="block">
        {/* Compact image - smaller than PostCard */}
        <div className="relative h-48 mb-3 overflow-hidden">
          {article.thumbnail ? (
            <Image
              src={
                article.thumbnail
                  ? `${baseUrl}${article.thumbnail}`
                  : "/placeholder.svg"
              }
              alt={article.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
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
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background opacity-90" />
        </div>

        {/* Metadata - similar to PostCard but more compact */}
        {/* <div className="flex items-center gap-2 mb-2 text-xs text-gray-400">
          <span>{formatDate(new Date(article.date), lang)}</span>
          <span className="inline-flex items-center">
            <span className="w-1 h-1 rounded-full bg-gray-400 mx-1"></span>
            <User className="h-3 w-3 mr-1" />
            <button
              onClick={handleAuthorClick}
              className="hover:text-primary-500 transition-colors cursor-pointer"
            >
              {article.author.name}
            </button>
          </span>
        </div> */}

        {/* Title with arrow - similar to PostCard */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-bold text-primary-500 group-hover:text-primary-600 transition-colors line-clamp-2 leading-tight">
            {article.title}
          </h3>
          <ArrowUpRight className="h-4 w-4 mt-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2" />
        </div>

        {/* Description - if available */}
        {article.description && (
          <p className="text-gray-400 text-sm mb-3 line-clamp-2">
            {article.description}
          </p>
        )}

        {/* Tags - if available, more compact than PostCard */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 line-clamp-1 h-5 overflow-hidden">
            {article.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs py-0 px-2 h-5"
              >
                {getTagDisplayName(tag, lang)}
              </Badge>
            ))}
            {article.tags.length > 3 && (
              <span className="text-xs text-gray-500 self-center">
                +{article.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </Link>
    </div>
  );
}
