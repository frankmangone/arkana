"use client";

import Link from "next/link";
import Image from "next/image";
import { PostPreview } from "@/lib/posts";
import { useRouter } from "next/navigation";
import { ArrowUpRight, User, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Tag } from "@/components/ui/tag";
import { withLocalePath, withSiteUrl } from "@/lib/site-config";

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

  const thumbnail = post.thumbnail
    ? post.thumbnail.startsWith("http")
      ? post.thumbnail
      : withSiteUrl(post.thumbnail)
    : "/placeholder.svg";

  const date = formatDate(post.date, lang);

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(withLocalePath(lang, `writers/${post.author.slug}`));
  };

  return (
    <div className="group flex flex-col">
      <Link
        href={withLocalePath(lang, `blog/${post.slug}`)}
        className="block w-full"
      >
        <div
          className={`grid grid-cols-5 gap-4 ${
            isLarge ? "md:grid-cols-1 md:gap-0" : "h-40 md:h-52 md:grid-cols-2"
          }`}
        >
          <div
            className={`relative col-span-2 overflow-hidden rounded-md border border-rule transition-colors group-hover:border-rule-strong md:col-span-1 ${
              imageClassName ?? ""
            } h-40 ${isLarge ? "md:mb-5 md:h-[27.5rem]" : "md:h-52"}`}
          >
            <Image
              src={thumbnail}
              alt={post.title}
              fill
              className="object-cover"
            />

            {/* Reading time indicator */}
            <div className="absolute right-3 top-3 flex items-center rounded-[3px] border border-rule bg-surface-page/80 px-2 py-1 text-xs text-ink-body backdrop-blur-sm">
              <Clock className="mr-1 h-3 w-3" />
              {post.readingTime || "5 min read"}
            </div>
          </div>
          <div
            className={`col-span-3 flex flex-col justify-between overflow-hidden md:col-span-1 ${
              !isLarge ? "md:h-full" : ""
            }`}
          >
            <div className="overflow-hidden">
              <div className="mb-3 flex min-w-0 justify-between gap-3 text-xs text-ink-faint">
                <span className="flex-shrink-0">{date}</span>
                <span className="inline-flex min-w-0 flex-1 items-center justify-end">
                  <User className="mr-1 h-3 w-3 flex-shrink-0" />
                  <button
                    onClick={handleAuthorClick}
                    className="cursor-pointer truncate transition-colors hover:text-primary-800"
                  >
                    {post.author.name}
                  </button>
                </span>
              </div>
              <div className="flex items-start justify-between">
                <h2
                  className={`mb-3 min-w-0 flex-1 text-xl font-semibold tracking-tight text-ink-heading transition-colors group-hover:text-primary-800 line-clamp-2 md:line-clamp-1 ${
                    isLarge ? "md:text-3xl" : ""
                  }`}
                >
                  {post.title}
                </h2>
                <ArrowUpRight className="ml-2 mt-1 h-5 w-5 flex-shrink-0 text-primary-800 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <div className="hidden md:block">
                <p
                  className={`mb-4 line-clamp-2 text-sm text-ink-muted ${
                    isLarge ? "md:mb-5 md:text-base" : ""
                  }`}
                >
                  {post.description}
                </p>
              </div>
            </div>
            <div className="flex max-h-[56px] flex-wrap gap-2 overflow-hidden">
              {post.tags.map((tag) => (
                <Tag key={tag} tag={tag} lang={lang} />
              ))}
            </div>
          </div>
        </div>
      </Link>
      <div className="mt-6 border-t border-rule md:hidden" />
    </div>
  );
}
