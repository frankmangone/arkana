import Image from "next/image";
import Link from "next/link";
import { PostPreview } from "@/lib/posts";
import { getTagDisplayName } from "@/lib/tags";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight } from "lucide-react";
import { formatDate } from "@/lib/date-utils";

interface PostCardProps {
  post: PostPreview;
  lang: string;
  imageClassName?: string;
}

export function PostCard(props: PostCardProps) {
  const { post, lang, imageClassName } = props;

  return (
    <div className="group">
      <Link href={`/${lang}/blog/${post.slug}`} className="block">
        <div
          className={`relative h-64 mb-4 overflow-hidden hidden md:block ${imageClassName}`}
        >
          <Image
            src={
              `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${post.thumbnail}` ||
              "/placeholder.svg"
            }
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background opacity-90" />
        </div>
        <div className="mb-2 text-sm text-gray-400">
          {formatDate(new Date(post.date), lang)}
        </div>
        <div className="flex items-start justify-between">
          <h2 className="text-xl font-bold mb-2 text-primary-500 group-hover:text-primary-600 transition-colors line-clamp-1">
            {post.title}
          </h2>
          <ArrowUpRight className="h-5 w-5 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <p className="text-gray-400 text-md mb-4 line-clamp-2">
          {post.description}
        </p>
        <div className="flex flex-wrap gap-2 line-clamp-1 h-6 overflow-hidden">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {getTagDisplayName(tag, lang)}
            </Badge>
          ))}
        </div>
      </Link>
    </div>
  );
}
