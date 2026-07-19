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
    return <div className="hidden md:block" />;
  }

  const post = await getPostBySlug(prevItem.slug, lang);

  if (!post) {
    return <div className="hidden md:block" />;
  }

  return (
    <Link
      href={`/${lang}/reading-lists/${id}/${prevItem.id}`}
      className="group flex h-full flex-col gap-3 rounded-md border border-rule p-5 transition-colors hover:border-primary-700"
    >
      <span className="eyebrow flex items-center gap-2 text-ink-faint">
        <ArrowLeft size={14} className="shrink-0" />
        Previous
      </span>
      <span className="font-medium text-ink-heading transition-colors group-hover:text-primary-800">
        {post.metadata.title}
      </span>
    </Link>
  );
}
