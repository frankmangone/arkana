"use client";

import Link from "next/link";
import Image from "next/image";
import { getTagDisplayName } from "@/lib/tags";
import { Badge } from "@/components/ui/badge";

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
      <div className="flex flex-col sm:flex-row">
        {/* Thumbnail - full width on mobile, fixed width on desktop */}
        <div className="w-full sm:w-[220px] relative">
          <div className="w-full h-[200px] sm:h-full relative">
            <Image
              src={imageSrc}
              alt={title}
              fill
              className="object-cover bg-white"
              sizes="(max-width: 640px) 100vw, 220px"
            />
            <div className="absolute inset-0 bg-gradient-to-b sm:bg-gradient-to-r from-transparent to-background opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 relative">
          <div className="absolute top-4 right-4 w-8 h-8 text-primary-400 rounded-full flex items-center justify-center text-md font-bold shadow-sm">
            {index + 1}
          </div>

          <Link
            href={`/${lang}/blog/${item.slug}`}
            className="text-lg font-semibold text-primary-500 hover:text-primary-600 line-clamp-2 mb-1 pr-12"
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
            {tags.map((tag: string) => (
              <Badge key={tag} variant="outline">
                {getTagDisplayName(tag, lang)}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
