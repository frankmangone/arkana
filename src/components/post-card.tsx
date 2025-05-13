import Image from "next/image";
import Link from "next/link";
import { PostPreview } from "@/lib/posts";
import { getTagDisplayName } from "@/lib/tags";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight } from "lucide-react";

interface PostCardProps {
  post: PostPreview;
  lang: string;
  variant?: "default" | "large";
}

export function PostCard({ post, lang, variant = "default" }: PostCardProps) {
  const isLarge = variant === "large";

  return (
    <div className="group">
      <Link href={`/${lang}/blog/${post.slug}`} className="block">
        {isLarge ? (
          <>
            <div className="relative h-80 mb-4 overflow-hidden">
              <Image
                src={
                  `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${
                    post.thumbnail
                  }` || "/placeholder.svg"
                }
                alt={post.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="mb-2 text-gray-400">
              {new Date(post.date).toLocaleDateString("en-US", {
                weekday: "long",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </div>
            <div className="flex items-start justify-between">
              <h2 className="text-2xl font-bold mb-2 text-primary-500 group-hover:text-primary-600 transition-colors line-clamp-1">
                {post.title}
              </h2>
              <ArrowUpRight className="h-5 w-5 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-gray-400 mb-4 line-clamp-2">
              {post.description}
            </p>
            <div className="flex flex-wrap gap-2 line-clamp-1 h-6 overflow-hidden">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {getTagDisplayName(tag, lang)}
                </Badge>
              ))}
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-40">
            <div className="relative overflow-hidden">
              <Image
                src={
                  `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${
                    post.thumbnail
                  }` || "/placeholder.svg"
                }
                alt={post.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col justify-between h-full">
              <div>
                <div className="mb-1 text-gray-400 text-sm">
                  {new Date(post.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
                <h3 className="text-xl font-bold mb-2 text-primary-500 group-hover:text-primary-600 transition-colors line-clamp-1">
                  {post.title}
                </h3>
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                  {post.description}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 line-clamp-1 h-6 overflow-hidden">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {getTagDisplayName(tag, lang)}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </Link>
    </div>
  );
}
