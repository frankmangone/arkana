import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import type { Post } from "@/lib/types";

interface PostHeaderProps {
  post: Post;
  lang: string;
}

export function PostHeader(props: PostHeaderProps) {
  const { post, lang } = props;
  const { metadata } = post;

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
        <Avatar>
          <AvatarImage
            src="/placeholder.svg?height=40&width=40"
            alt={metadata.author}
          />
          <AvatarFallback>{metadata.author.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{metadata.author}</div>
          <div className="text-sm text-muted-foreground">
            {formatDate(metadata.date, lang)} · {metadata.readingTime} read
          </div>
        </div>
      </div>
    </div>
  );
}
