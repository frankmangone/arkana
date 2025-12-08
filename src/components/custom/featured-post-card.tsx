"use client";

import Link from "next/link";
import Image from "next/image";
import { PostPreview } from "@/lib/posts";
import { useRouter } from "next/navigation";
import { ArrowUpRight, User, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Tag } from "@/components/custom/tag";

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

  const thumbnail = post.thumbnail
    ? post.thumbnail.startsWith("http")
      ? post.thumbnail
      : `${baseUrl}${post.thumbnail}`
    : "/placeholder.svg";

  const date = formatDate(post.date, lang);

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`${baseUrl}/${lang}/writers/${post.author.slug}`);
  };

  return (
    <div className="group flex flex-col items-center">
      <Link
        href={`${baseUrl}/${lang}/blog/${post.slug}`}
        className="block w-full"
      >
        <div
          className={`grid gap-4 grid-cols-5 ${
            isLarge ? "md:grid-cols-1 md:gap-0" : "md:grid-cols-2 h-40"
          }`}
        >
          <div
            className={`relative overflow-hidden col-span-2 md:col-span-1 ${
              imageClassName ?? ""
            } h-40 ${isLarge ? "md:h-80 md:mb-4" : "md:h-40"}`}
          >
            <Image
              src={thumbnail}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background opacity-90" />

            {/* Reading time indicator */}
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {post.readingTime || "5 min read"}
            </div>
          </div>
          <div
            className={`flex flex-col justify-between overflow-hidden col-span-3 md:col-span-1 ${
              !isLarge ? "md:h-full" : ""
            }`}
          >
            <div className="overflow-hidden">
              <div className="flex justify-between gap-3 mb-2 text-sm text-gray-400 min-w-0">
                <span className="flex-shrink-0">{date}</span>
                <span className="inline-flex items-center min-w-0 flex-1 justify-end">
                  <User className="h-3 w-3 mr-1 flex-shrink-0" />
                  <button
                    onClick={handleAuthorClick}
                    className="hover:text-primary-500 cursor-pointer transition-colors truncate"
                  >
                    {post.author.name}
                  </button>
                </span>
              </div>
              <div className="flex items-start justify-between">
                <h2
                  className={`font-bold mb-2 text-xl text-primary-500 group-hover:text-primary-600 transition-colors line-clamp-2 md:line-clamp-1 flex-1 min-w-0 ${
                    isLarge ? "md:text-2xl" : ""
                  }`}
                >
                  {post.title}
                </h2>
                <ArrowUpRight className="h-5 w-5 mt-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2" />
              </div>
              <div className="hidden md:block">
                <p
                  className={`text-gray-400 mb-3 text-sm line-clamp-2 ${
                    isLarge ? "md:text-md md:mb-4" : ""
                  }`}
                >
                  {post.description}
                </p>
              </div>
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
