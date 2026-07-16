import { Suspense } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import type { Post } from "@/lib/types";
import { getWriter } from "@/lib/writers";
import { getDictionary } from "@/lib/dictionaries";
import { ExternalLink } from "lucide-react";
import { ArkanaStrip } from "@/components/arkana-strip";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/breadcrumbs";
import { Tag } from "@/components/ui/tag";
import { Link } from "@/components/ui/link";
import { PostActions } from "@/components/ui/post-actions";

interface PostHeaderProps {
  post: Post;
  lang: string;
  path?: string;
  breadcrumbs?: BreadcrumbItem[];
}

// ~3.4:1 against --grad-hero: decorative texture, deliberately quieter than text
const HERO_GLYPH_INK = "hsl(260, 50%, 28%)";

export async function PostHeader(props: PostHeaderProps) {
  const { post, lang, path, breadcrumbs } = props;
  const { metadata } = post;
  const dict = await getDictionary(lang);
  const writer = getWriter(metadata.author);

  return (
    <header className="mb-10">
      {/* Full-bleed vivid hero field */}
      <div className="full-bleed brand-hero">
        <div className="px-4 pb-16 pt-8 md:px-6 md:pb-24 lg:px-8">
          {/* From xl, indent the breadcrumbs to the title column's left edge
              ((100% - 48rem)/2), so they sit on the same axis as the
              tags/title/body reading flow. */}
          {breadcrumbs && (
            <Breadcrumbs
              lang={lang}
              items={breadcrumbs}
              variant="onBrand"
              className="mb-12 md:mb-16 xl:ml-[max(0rem,calc((100%-48rem)/2))]"
            />
          )}

          {/* The center column is minmax(0,48rem) flanked by equal 1fr
              gutters, so it sits exactly where the article's centered
              max-w-3xl column does and the title aligns with the body.
              The metadata rail occupies the left gutter from xl up. */}
          <div className="flex flex-col gap-10 xl:grid xl:grid-cols-[1fr_minmax(0,48rem)_1fr] xl:gap-x-10">
            {/* Metadata rail */}
            <aside className="order-2 mx-auto flex w-full max-w-3xl flex-wrap items-start gap-x-12 gap-y-7 xl:order-1 xl:col-start-1 xl:row-start-1 xl:mx-0 xl:w-44 xl:max-w-none xl:flex-col xl:justify-self-end">
              <div>
                <p className="eyebrow mb-1.5 font-semibold text-ink-on-brand">
                  {dict.blog.date}
                </p>
                <p className="text-ink-on-brand-soft">
                  {formatDate(metadata.date, lang)}
                </p>
              </div>
              <div>
                <p className="eyebrow mb-1.5 font-semibold text-ink-on-brand">
                  {dict.blog.author}
                </p>
                <Link
                  href={`/${lang}/writers/${writer.slug}`}
                  className="flex items-center gap-2 text-ink-on-brand-soft no-underline hover:underline"
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
                <p className="text-ink-on-brand-soft">
                  {metadata.readingTime} {dict.blog.readingTime}
                  {metadata.mediumUrl && (
                    <>
                      {" · "}
                      <Link
                        href={metadata.mediumUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-ink-on-brand-soft no-underline hover:underline"
                      >
                        Medium <ExternalLink size={14} />
                      </Link>
                    </>
                  )}
                </p>
              </div>
              {path && (
                <div className="-ml-2.5">
                  <Suspense fallback={null}>
                    <PostActions path={path} />
                  </Suspense>
                </div>
              )}
            </aside>

            {/* Title block */}
            <div className="order-1 mx-auto w-full max-w-3xl xl:order-2 xl:col-start-2 xl:row-start-1 xl:mx-0 xl:max-w-none">
              <div className="mb-8 flex flex-wrap gap-2 [&_[data-slot=badge]]:border-rule-on-brand [&_[data-slot=badge]]:text-ink-on-brand-soft">
                {metadata.tags.map((tag) => (
                  <Tag key={tag} tag={tag} lang={lang} />
                ))}
              </div>

              <h1 className="display-title mb-7 !text-[clamp(2.5rem,5vw,4.25rem)] text-ink-on-brand-title">
                {metadata.title}
              </h1>

              {metadata.description && (
                <p className="mb-10 max-w-[58ch] text-xl leading-relaxed text-ink-on-brand-soft">
                  {metadata.description}
                </p>
              )}

              <ArkanaStrip
                content={post.content}
                preCalculatedHash={metadata.contentHash}
                lineColor={HERO_GLYPH_INK}
                className="!my-0 !justify-start"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
