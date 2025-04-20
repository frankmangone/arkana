import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import type { Post } from "@/lib/types";
import { getWriter } from "@/lib/writers";

interface PostHeaderProps {
  post: Post;
  lang: string;
}

export function PostHeader(props: PostHeaderProps) {
  const { post, lang } = props;
  const { metadata } = post;

  const writer = getWriter(metadata.author);

  return (
    <div className="mb-8 space-y-6">
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {metadata.tags.map((tag) => (
            <Link key={tag} href={`/${lang}/blog?tag=${tag}`}>
              <Badge variant="secondary">{tag}</Badge>
            </Link>
          ))}
        </div>
        <h1 className="text-4xl font-bold">{metadata.title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <Avatar className="w-[50px] h-[50px]">
          <AvatarImage
            src={writer.avatarUrl}
            alt={writer.name}
            width={50}
            height={50}
          />
          <AvatarFallback>{writer.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{writer.name}</div>
          <div className="text-sm text-muted-foreground">
            {formatDate(metadata.date, lang)} · {metadata.readingTime} read
          </div>
        </div>
      </div>
    </div>
  );
}
