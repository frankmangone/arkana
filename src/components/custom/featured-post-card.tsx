"use client";

import Link from "next/link";
import Image from "next/image";
import { PostPreview } from "@/lib/posts";
import { useRouter } from "next/navigation";
import { ArrowUpRight, User } from "lucide-react";
import { formatDate } from "@/lib/date-utils";
import { Tag } from "@/components/tag";

export interface FeaturedPostCardProps {
  post: PostPreview;
  lang: string;
  imageClassName?: string;
  variant?: "default" | "large";
}

export function FeaturedPostCard(props: FeaturedPostCardProps) {
  const { variant = "default", imageClassName, ...otherProps } = props;
  const { post, lang } = otherProps;

  const router = useRouter();

  const isLarge = variant === "large";
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://arkana.blog";

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`${baseUrl}/${lang}/writers/${post.author.slug}`);
  };

  const thumbnail = post.thumbnail
    ? `${baseUrl}${post.thumbnail}`
    : "/placeholder.svg";
  const date = formatDate(new Date(post.date), lang);

  return (
    <div className="group flex flex-col items-center">
      <Link
        href={`${baseUrl}/${lang}/blog/${post.slug}`}
        className="block w-full"
      >
        <div
          className={`grid grid-cols-1 ${
            !isLarge ? "md:grid-cols-2 gap-4 h-40" : ""
          }`}
        >
          <div
            className={`relative overflow-hidden hidden md:block ${imageClassName} ${
              isLarge ? "h-80 mb-4" : "h-40"
            }`}
          >
            <Image
              src={thumbnail}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background opacity-90" />
          </div>
          <div
            className={`flex flex-col justify-between ${
              !isLarge ? "h-full" : ""
            }`}
          >
            <div>
              <div className="flex justify-between gap-3 mb-2 text-sm text-gray-400">
                <span>{date}</span>
                <span className="inline-flex items-center">
                  <User className="h-3 w-3 mr-1" />
                  <button
                    onClick={handleAuthorClick}
                    className="hover:text-primary-500 cursor-pointer transition-colors"
                  >
                    {post.author.name}
                  </button>
                </span>
              </div>
              <div className="flex items-start justify-between">
                <h2
                  className={`font-bold mb-2 text-primary-500 group-hover:text-primary-600 transition-colors line-clamp-1 ${
                    isLarge ? "text-2xl" : "text-xl"
                  }`}
                >
                  {post.title}
                </h2>
                <ArrowUpRight className="h-5 w-5 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p
                className={`text-gray-400 mb-4 line-clamp-2 ${
                  !isLarge ? "text-sm mb-3" : ""
                }`}
              >
                {post.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 line-clamp-1 h-6 overflow-hidden">
              {post.tags.map((tag) => (
                <Tag key={tag} tag={tag} lang={lang} />
              ))}
            </div>
          </div>
        </div>
      </Link>
      <div className="w-1/2 h-[1px] bg-primary-500/20 mt-6 md:hidden" />
    </div>
  );
}
