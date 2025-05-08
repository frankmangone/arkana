import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PostPreview } from "@/lib/posts";
import { getTagDisplayName } from "@/lib/tags";

interface PostCardProps {
  article: PostPreview;
  lang: string;
  number?: number;
}

export function PostCard({ article, lang, number }: PostCardProps) {
  return (
    <div
      key={article.slug}
      className="relative border rounded-lg overflow-hidden hover:shadow-md bg-background transition-shadow group"
    >
      {/* Optional number display */}
      {number !== undefined && (
        <div className="absolute top-4 left-4 z-20 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold shadow-md">
          {number}
        </div>
      )}

      {/* Image with gradient overlay */}
      {article.thumbnail && (
        <div className="relative h-48 w-full">
          <Image
            src={
              `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${
                article.thumbnail
              }` || "/placeholder.svg"
            }
            alt={article.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background opacity-100 transition-opacity" />
        </div>
      )}

      {/* Content */}
      <div className={cn("p-6", article.thumbnail && "-mt-8 relative z-10")}>
        <p className="text-sm text-muted-foreground mb-2">
          {new Date(article.date).toLocaleDateString()} • {article.readingTime}
        </p>
        <h3 className="text-xl font-semibold mb-2">
          <Link
            href={`/${lang}/blog/${article.slug}`}
            className="text-primary-500 hover:text-primary-600 transition-colors"
          >
            {article.title}
          </Link>
        </h3>
        <p className="text-muted-foreground mb-4 line-clamp-2">
          {article.description}
        </p>
        <div className="flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <span key={tag} className="bg-muted px-2 py-1 rounded text-sm">
              {getTagDisplayName(tag, lang)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
