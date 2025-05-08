"use client";

import Link from "next/link";
import Image from "next/image";
import { getTagDisplayName } from "@/lib/tags";

interface ReadingListCardProps {
  // TODO: Improve this typing
  item: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  index: number;
  lang: string;
  dictionary: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export function ReadingListCard(props: ReadingListCardProps) {
  const { item, index, lang } = props;

  // Check if post exists and extract metadata
  if (!item.post) return null;

  const { title, readingTime, date, description, tags, thumbnail } =
    item.post.metadata;

  // Default thumbnail if none is provided
  const imageSrc =
    `${process.env.NEXT_PUBLIC_BASE_PATH}${thumbnail}` ||
    "/images/article-placeholder.webp";

  return (
    <div className="border rounded-lg overflow-hidden transition-all bg-background hover:shadow-md mb-4">
      <div className="flex">
        {/* Left side: Number and Thumbnail */}
        <div className="flex-shrink-0 w-[160px] relative">
          <div className="absolute top-2 left-2 w-8 h-8 bg-primary-900 text-primary-300 rounded-full flex items-center justify-center text-sm font-bold z-10">
            {index + 1}
          </div>
          <div className="w-[160px] h-full relative">
            <Image
              src={imageSrc}
              alt={title}
              fill
              className="object-cover bg-white"
              sizes="160px"
            />
          </div>
        </div>

        {/* Right side: Content */}
        <div className="flex-1 p-4">
          <Link
            href={`/${lang}/blog/${item.slug}`}
            className="text-lg font-semibold text-primary-500 hover:text-primary-600 line-clamp-2 mb-1"
          >
            {title}
          </Link>

          <p className="text-xs text-muted-foreground mb-2">
            {readingTime} • {new Date(date).toLocaleDateString()}
          </p>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {item.description || description}
          </p>

          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag: string) => (
              <span
                key={tag}
                className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full"
              >
                {getTagDisplayName(tag, lang)}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-xs text-muted-foreground px-1">
                +{tags.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
