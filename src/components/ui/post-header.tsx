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

export async function PostHeader(props: PostHeaderProps) {
  const { post, lang, path } = props;
  const { metadata } = post;
  const dict = await getDictionary(lang);
  const writer = getWriter(metadata.author);

  return (
    <header className="mb-10">
      <div className="brand-band mb-6 px-6 py-10 md:px-10 md:py-14">
        <div className="mb-7 flex flex-wrap gap-2">
          {metadata.tags.map((tag) => (
            <Tag key={tag} tag={tag} lang={lang} />
          ))}
        </div>

        <h1 className="mb-10 text-4xl font-bold leading-[1.08] tracking-tight text-ink-heading md:text-[3.5rem]">
          {metadata.title}
        </h1>

        <ArkanaStrip
          content={post.content}
          preCalculatedHash={metadata.contentHash}
          className="!my-0 opacity-90"
        />
      </div>

      <div className="flex flex-col gap-4 border-b border-rule pb-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/${lang}/writers/${writer.slug}`} className="no-underline">
            <Avatar className="h-9 w-9">
              <AvatarImage
                src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${
                  writer.avatarUrl
                }`}
                alt={writer.name}
                width={36}
                height={36}
              />
              <AvatarFallback>{writer.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
            <Link
              href={`/${lang}/writers/${writer.slug}`}
              className="font-medium text-ink-heading no-underline hover:underline"
            >
              {writer.name}
            </Link>
            <div className="text-sm text-ink-muted">
              {formatDate(metadata.date, lang)} · {metadata.readingTime}{" "}
              {dict.blog.readingTime}
              {metadata.mediumUrl && (
                <>
                  {" · "}
                  <Link
                    href={metadata.mediumUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 no-underline hover:underline"
                  >
                    Medium <ExternalLink size={14} />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
        {path && (
          <div className="flex justify-end md:block">
            <Suspense fallback={null}>
              <PostActions path={path} />
            </Suspense>
          </div>
        )}
      </div>
    </header>
  );
}
