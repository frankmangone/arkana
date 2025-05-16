"use client";

import Image from "next/image";
import Link from "next/link";
import { User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight } from "lucide-react";
import { formatDate } from "@/lib/date-utils";
import { PostPreview } from "@/lib/posts";
import { getTagDisplayName } from "@/lib/tags";
import { useRouter } from "next/navigation";

interface PostCardProps {
  post: PostPreview;
  lang: string;
  imageClassName?: string;
}

export function PostCard(props: PostCardProps) {
  const { post, lang, imageClassName } = props;
  const router = useRouter();

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`/${lang}/writers/${post.author.slug}`);
  };

  return (
    <div className="group flex flex-col items-center">
      <Link
        href={`/${lang}/blog/${post.slug}`}
        className="block my-2 md:my-0 w-full"
      >
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
        <div className="flex items-center gap-3 mb-2 text-sm text-gray-400">
          <span>{formatDate(new Date(post.date), lang)}</span>
          <span className="inline-flex items-center">
            <span className="w-1 h-1 rounded-full bg-gray-400 mx-1"></span>
            <User className="h-3 w-3 mr-1" />
            <button
              onClick={handleAuthorClick}
              className="hover:text-primary-500 transition-colors cursor-pointer"
            >
              {post.author.name}
            </button>
          </span>
        </div>
        <div className="flex items-start justify-between">
          <h2 className="text-xl font-bold mb-2 text-primary-500 group-hover:text-primary-600 transition-colors">
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
      <div className="w-1/2 h-[1px] bg-primary-500/20 mt-6 md:hidden" />
    </div>
  );
}
