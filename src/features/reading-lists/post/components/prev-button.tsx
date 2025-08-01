import { Button } from "@/components/ui/button";
import { getPostBySlug } from "@/features/posts/actions";
import { ReadingListItem } from "@/lib/reading-lists";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PrevButtonProps {
  lang: string;
  id: string;
  prevItem?: ReadingListItem | null;
}

export async function PrevButton(props: PrevButtonProps) {
  const { lang, id, prevItem } = props;

  if (!prevItem) {
    return <div className="basis-[240px]" />;
  }

  const post = await getPostBySlug(prevItem.slug, lang);

  if (!post) {
    return <div className="basis-[280px]" />;
  }

  return (
    <Button
      asChild
      variant="outline"
      size="lg"
      className="flex h-28 md:basis-[280px] justify-between items-start gap-2 border-primary-400 dark:border-primary-400"
    >
      <Link
        href={`/${lang}/reading-lists/${id}/${prevItem.id}`}
        className="flex flex-col w-full justify-start gap-4 items-end py-4"
      >
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <ArrowLeft size={16} className="shrink-0" />
          <span>Previous</span>
        </div>
        <div className="text-primary-500 dark:text-primary-500 font-medium line-clamp-2 break-word whitespace-normal">
          {post.metadata.title}
        </div>
      </Link>
    </Button>
  );
}
