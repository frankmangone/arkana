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
    return <div className="hidden md:block" />;
  }

  const post = await getPostBySlug(nextItem.slug, lang);

  if (!post) {
    return <div className="hidden md:block" />;
  }

  return (
    <Link
      href={`/${lang}/reading-lists/${id}/${nextItem.id}`}
      className="group flex h-full flex-col items-end gap-3 rounded-md border border-rule p-5 text-right transition-colors hover:border-primary-700"
    >
      <span className="eyebrow flex items-center gap-2 text-ink-faint">
        Next
        <ArrowRight size={14} className="shrink-0" />
      </span>
      <span className="font-medium text-ink-heading transition-colors group-hover:text-primary-800">
        {post.metadata.title}
      </span>
    </Link>
  );
}
