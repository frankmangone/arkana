"use client";

import Image from "next/image";
import Link from "next/link";
import { User } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { formatDate } from "@/lib/date-utils";
import { PostPreview } from "@/lib/posts";
import { useRouter } from "next/navigation";
import { Tag } from "./tag";

interface PostCardProps {
  post: PostPreview;
  lang: string;
  imageClassName?: string;
  overrideUrl?: string;
}

export function PostCard(props: PostCardProps) {
  const { post, lang, imageClassName, overrideUrl } = props;
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://arkana.blog";
  const url = overrideUrl ?? `${baseUrl}/${lang}/blog/${post.slug}`;

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(url);
  };

  return (
    <div className="group flex flex-col items-center">
      <Link href={url} className="block my-2 md:my-0 w-full">
        <div
          className={`relative h-64 mb-4 overflow-hidden hidden md:block ${imageClassName}`}
        >
          <Image
            src={
              post.thumbnail
                ? `${baseUrl}${post.thumbnail}`
                : "/placeholder.svg"
            }
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background opacity-90" />
        </div>
        <div className="flex justify-between items-center gap-3 mb-2 text-sm text-gray-400">
          <span>{formatDate(new Date(post.date), lang)}</span>
          <span className="inline-flex items-center">
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
            <Tag key={tag} tag={tag} lang={lang} />
          ))}
        </div>
      </Link>
      <div className="w-1/2 h-[1px] bg-primary-500/20 mt-6 md:hidden" />
    </div>
  );
}
