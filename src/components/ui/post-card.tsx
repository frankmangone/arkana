"use client";

import Link from "next/link";
import { User, Clock } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { PostPreview } from "@/lib/posts";
import { useRouter } from "next/navigation";
import { Tag } from "./tag";
import { TintedThumbnail } from "./tinted-thumbnail";
import { withLocalePath, resolveThumbnailUrl } from "@/lib/site-config";

interface PostCardProps {
  post: PostPreview;
  lang: string;
  imageClassName?: string;
  overrideUrl?: string;
}

export function PostCard(props: PostCardProps) {
  const { post, lang, imageClassName, overrideUrl } = props;
  const router = useRouter();
  const url = overrideUrl ?? withLocalePath(lang, `blog/${post.slug}`);

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(url);
  };

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-md border border-rule transition-colors hover:border-rule-strong">
      <Link href={url} className="flex h-full w-full flex-col">
        <div
          className={`relative hidden h-48 overflow-hidden border-b border-rule md:block ${imageClassName}`}
        >
          <TintedThumbnail
            src={resolveThumbnailUrl(post.thumbnail)}
            alt={post.title}
          />
        </div>
        <div className="flex flex-1 flex-col p-5">
          <div className="mb-3 flex items-center justify-between gap-3 text-xs text-ink-faint">
            <span className="inline-flex items-center gap-3">
              <span>{formatDate(post.date, lang)}</span>
              <span className="inline-flex items-center">
                <Clock className="mr-1 h-3 w-3" />
                {post.readingTime || "5 min read"}
              </span>
            </span>
            <span className="inline-flex items-center">
              <User className="mr-1 h-3 w-3" />
              <button
                onClick={handleAuthorClick}
                className="cursor-pointer transition-colors hover:text-primary-800"
              >
                {post.author.name}
              </button>
            </span>
          </div>
          <div className="flex items-start justify-between">
            <h2 className="mb-2 text-xl font-semibold tracking-tight text-ink-heading transition-colors group-hover:text-primary-800">
              {post.title}
            </h2>
            <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-primary-800 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          <p className="mb-4 line-clamp-2 text-sm text-ink-muted">
            {post.description}
          </p>
          <div className="mt-auto flex max-h-[64px] flex-wrap gap-2 overflow-hidden">
            {post.tags.map((tag) => (
              <Tag key={tag} tag={tag} lang={lang} />
            ))}
          </div>
        </div>
      </Link>
    </div>
  );
}
