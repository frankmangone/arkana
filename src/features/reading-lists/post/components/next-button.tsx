import { Button } from "@/components/ui/button";
import { getPostBySlug } from "@/features/posts/actions";
import { ReadingListItem } from "@/lib/reading-lists";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface NextButtonProps {
  lang: string;
  id: string;
  nextItem?: ReadingListItem | null;
}

export async function NextButton(props: NextButtonProps) {
  const { lang, id, nextItem } = props;

  if (!nextItem) {
    return <div className="basis-[240px]" />;
  }

  const post = await getPostBySlug(nextItem.slug, lang);

  if (!post) {
    return <div className="basis-[280px]" />;
  }

  return (
    <Button
      asChild
      variant="outline"
      size="lg"
      className="flex h-28 md:basis-[280px] justify-between items-end gap-2 border-primary-400 dark:border-primary-400"
    >
      <Link
        href={`/${lang}/reading-lists/${id}/${nextItem.id}`}
        className="flex flex-col w-full justify-start gap-4 items-end py-4"
      >
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 w-full justify-end">
          <span>Next</span>
          <ArrowRight size={16} className="shrink-0" />
        </div>
        <div className="text-primary-500 dark:text-primary-500 font-medium line-clamp-2 break-word whitespace-normal text-right">
          {post.metadata.title}
        </div>
      </Link>
    </Button>
  );
}
