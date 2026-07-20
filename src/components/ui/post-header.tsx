import { Suspense } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import type { Post } from "@/lib/types";
import { getWriter } from "@/lib/writers";
import { getDictionary } from "@/lib/dictionaries";
import { resolveThumbnailUrl } from "@/lib/site-config";
import { Clock, ExternalLink } from "lucide-react";
import { ArkanaStrip } from "@/components/arkana-strip";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/breadcrumbs";
import { Tag } from "@/components/ui/tag";
import { Link } from "@/components/ui/link";
import { PostActions } from "@/components/ui/post-actions";
import { TintedThumbnail } from "@/components/ui/tinted-thumbnail";

interface PostHeaderProps {
  post: Post;
  lang: string;
  path?: string;
  breadcrumbs?: BreadcrumbItem[];
}

export async function PostHeader(props: PostHeaderProps) {
  const { post, lang, path, breadcrumbs } = props;
  const { metadata } = post;
  const dict = await getDictionary(lang);
  const writer = getWriter(metadata.author);
  const thumbnailSrc = resolveThumbnailUrl(metadata.thumbnail);

  return (
    <header className="mb-10">
      {/* Full-bleed hero: post thumbnail with a dark purple duotone tint */}
      <div className="full-bleed relative overflow-hidden">
        <TintedThumbnail
          src={thumbnailSrc}
          alt=""
          priority
          imageClassName="object-top"
          variant="hero"
        />

        <div className="relative px-4 pb-4 pt-8 md:px-6 md:pb-24 lg:px-8">
          {/* From xl, indent the breadcrumbs to the title column's left edge
              ((100% - 48rem)/2), so they sit on the same axis as the
              tags/title/body reading flow. */}
          {breadcrumbs && (
            <Breadcrumbs
              lang={lang}
              items={breadcrumbs}
              variant="onPhoto"
              className="mb-12 md:mb-16 xl:ml-[max(0rem,calc((100%-48rem)/2))]"
            />
          )}

          {/* The center column is minmax(0,48rem) flanked by equal 1fr
              gutters, so it sits exactly where the article's centered
              max-w-3xl column does and the title aligns with the body.
              The metadata rail occupies the left gutter from xl up. */}
          <div className="flex flex-col gap-10 xl:grid xl:grid-cols-[1fr_minmax(0,48rem)_1fr] xl:gap-x-10">
            {/* Metadata rail */}
            <aside className="order-2 mx-auto grid w-full max-w-3xl grid-cols-2 items-start gap-x-8 gap-y-7 xl:order-1 xl:col-start-1 xl:row-start-1 xl:mx-0 xl:flex xl:w-44 xl:max-w-none xl:flex-col xl:justify-self-end">
              <div>
                <p className="eyebrow mb-1.5 font-semibold text-white/60">
                  {dict.blog.date}
                </p>
                <p className="text-white/80">
                  {formatDate(metadata.date, lang)}
                </p>
              </div>
              <div>
                <p className="eyebrow mb-1.5 font-semibold text-white/60">
                  {dict.blog.author}
                </p>
                <Link
                  href={`/${lang}/writers/${writer.slug}`}
                  className="flex items-center gap-2 text-white/80 no-underline hover:underline"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                      src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${
                        writer.avatarUrl
                      }`}
                      alt={writer.name}
                      width={24}
                      height={24}
                    />
                    <AvatarFallback>{writer.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {writer.name}
                </Link>
              </div>
              <div>
                <p className="eyebrow mb-1.5 font-semibold text-white/60">
                  {dict.blog.readingTimeLabel}
                </p>
                <p className="flex items-center gap-1.5 text-white/80">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  {metadata.readingTime} {dict.blog.readingTime}
                </p>
              </div>

              {metadata.mediumUrl && (
                <div>
                  <p className="eyebrow mb-1.5 font-semibold text-white/60">
                    {dict.blog.alsoOn}
                  </p>
                  <Link
                    href={metadata.mediumUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-white/80 no-underline hover:underline"
                  >
                    Medium <ExternalLink size={14} />
                  </Link>
                </div>
              )}
              {path && (
                <div className="col-span-2 xl:col-span-1 xl:-ml-2.5">
                  <Suspense fallback={null}>
                    <PostActions
                      path={path}
                      className="w-full justify-center gap-8 mt-4 xl:mt-0 xl:w-auto xl:justify-start xl:gap-2"
                    />
                  </Suspense>
                </div>
              )}
            </aside>

            {/* Title block */}
            <div className="order-1 mx-auto w-full max-w-3xl xl:order-2 xl:col-start-2 xl:row-start-1 xl:mx-0 xl:max-w-none">
              <div className="mb-8 flex flex-wrap gap-2 [&_[data-slot=badge]]:border-white/30 [&_[data-slot=badge]]:text-white/80 [&_[data-slot=badge]]:hover:border-primary-700 [&_[data-slot=badge]]:hover:text-primary-800">
                {metadata.tags.map((tag) => (
                  <Tag key={tag} tag={tag} lang={lang} />
                ))}
              </div>

              <h1 className="display-title mb-7 !text-[clamp(2.5rem,5vw,4.25rem)] text-white">
                {metadata.title}
              </h1>

              {metadata.description && (
                <p className="mb-10 max-w-[58ch] text-xl leading-relaxed text-white/80">
                  {metadata.description}
                </p>
              )}

              <ArkanaStrip
                content={post.content}
                preCalculatedHash={metadata.contentHash}
                lineColor="#FFF"
                className="!my-0 !justify-start"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
