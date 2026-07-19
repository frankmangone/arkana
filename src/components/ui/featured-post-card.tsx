"use client";

import Link from "next/link";
import { PostPreview } from "@/lib/posts";
import { useRouter } from "next/navigation";
import { ArrowUpRight, User, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { TagList } from "@/components/ui/tag-list";
import { TintedThumbnail } from "@/components/ui/tinted-thumbnail";
import { withLocalePath, resolveThumbnailUrl } from "@/lib/site-config";

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

  const thumbnail = resolveThumbnailUrl(post.thumbnail);

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
          className={`grid grid-cols-1 gap-4 overflow-hidden rounded-md border border-rule transition-colors group-hover:border-rule-strong md:grid-cols-2 md:overflow-visible md:rounded-none md:border-none ${
            isLarge ? "md:gap-8" : ""
          }`}
        >
          <div
            className={`relative self-start overflow-hidden border-b border-rule transition-colors group-hover:border-rule-strong md:rounded-md md:border md:border-rule ${
              imageClassName ?? ""
            } h-32 ${isLarge ? "md:h-[24rem]" : "md:h-52"}`}
          >
            <TintedThumbnail src={thumbnail} alt={post.title} />

            {/* Reading time indicator */}
            <div className="absolute right-3 top-3 flex items-center rounded-[3px] border border-rule bg-surface-page/80 px-2 py-1 text-xs text-ink-body backdrop-blur-sm">
              <Clock className="mr-1 h-3 w-3" />
              {post.readingTime || "5 min read"}
            </div>
          </div>
          <div className="flex flex-col p-5 pt-0 md:p-0">
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
                className={`mb-3 min-w-0 flex-1 text-xl font-semibold tracking-tight text-ink-heading transition-colors group-hover:text-primary-800 ${
                  isLarge ? "md:text-3xl" : ""
                }`}
              >
                {post.title}
              </h2>
              <ArrowUpRight className="ml-2 mt-1 h-5 w-5 flex-shrink-0 text-primary-800 opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <p
              className={`mb-4 line-clamp-2 text-sm text-ink-muted ${
                isLarge ? "md:mb-5 md:text-base" : ""
              }`}
            >
              {post.description}
            </p>
            <TagList tags={post.tags} lang={lang} />
          </div>
        </div>
      </Link>
    </div>
  );
}
