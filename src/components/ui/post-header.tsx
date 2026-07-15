import { Suspense } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import type { Post } from "@/lib/types";
import { getWriter } from "@/lib/writers";
import { getDictionary } from "@/lib/dictionaries";
import { ExternalLink } from "lucide-react";
import { ArkanaStrip } from "@/components/arkana-strip";
import { Tag } from "@/components/ui/tag";
import { Link } from "@/components/ui/link";
import { PostActions } from "@/components/ui/post-actions";

interface PostHeaderProps {
  post: Post;
  lang: string;
  path?: string;
}

const HERO_GLYPH_INK = "hsl(260, 75%, 16%)";

export async function PostHeader(props: PostHeaderProps) {
  const { post, lang, path } = props;
  const { metadata } = post;
  const dict = await getDictionary(lang);
  const writer = getWriter(metadata.author);

  return (
    <header className="mb-10">
      {/* Full-bleed vivid hero field */}
      <div className="full-bleed brand-hero">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:px-6 md:py-24 lg:grid-cols-[220px_1fr] lg:gap-16 lg:px-8">
          {/* Metadata rail */}
          <aside className="order-2 flex flex-wrap gap-x-12 gap-y-7 lg:order-1 lg:flex-col">
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
          </aside>

          {/* Title block */}
          <div className="order-1 lg:order-2">
            <div className="mb-8 flex flex-wrap gap-2 [&_[data-slot=badge]]:border-rule-on-brand [&_[data-slot=badge]]:text-ink-on-brand-soft">
              {metadata.tags.map((tag) => (
                <Tag key={tag} tag={tag} lang={lang} />
              ))}
            </div>

            <h1 className="display-title mb-7 !text-[clamp(2.75rem,5.5vw,4.75rem)] text-ink-on-brand">
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

      {path && (
        <div className="flex justify-end border-b border-rule py-4">
          <Suspense fallback={null}>
            <PostActions path={path} />
          </Suspense>
        </div>
      )}
    </header>
  );
}
