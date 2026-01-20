import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import type { Post } from "@/lib/types";
import { getWriter } from "@/lib/writers";
import { getDictionary } from "@/lib/dictionaries";
import { ExternalLink } from "lucide-react";
import { ArkanaStrip } from "@/components/arkana-strip";
import { Tag } from "@/components/custom/tag";
import { Link } from "@/components/ui/link";

interface PostHeaderProps {
  post: Post;
  lang: string;
}

export async function PostHeader(props: PostHeaderProps) {
  const { post, lang } = props;
  const { metadata } = post;
  const dict = await getDictionary(lang);
  const writer = getWriter(metadata.author);

  return (
    <div className="mb-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-4xl mb-6 font-bold">{metadata.title}</h1>

        <ArkanaStrip
          content={post.content}
          preCalculatedHash={metadata.contentHash}
        />

        <div className="flex flex-wrap gap-2 mt-6">
          {metadata.tags.map((tag) => (
            <Tag key={tag} tag={tag} lang={lang} />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link href={`/${lang}/writers/${writer.slug}`}>
          <Avatar className="w-[50px] h-[50px]">
            <AvatarImage
              src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${
                writer.avatarUrl
              }`}
              alt={writer.name}
              width={50}
              height={50}
            />
            <AvatarFallback>{writer.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </Link>
        <div>
          <Link
            href={`/${lang}/writers/${writer.slug}`}
            className="font-medium hover:underline"
          >
            {writer.name}
          </Link>
          <div className="text-sm text-muted-foreground">
            {formatDate(metadata.date, lang)} · {metadata.readingTime}{" "}
            {dict.blog.readingTime}
            {metadata.mediumUrl && (
              <>
                {" · "}
                <Link
                  href={metadata.mediumUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:underline"
                >
                  Medium <ExternalLink size={14} />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
