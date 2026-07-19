"use client";

import { getTagDisplayName } from "@/lib/tags";
import { withLocalePath } from "@/lib/site-config";
import { Badge } from "../ui/badge";

interface TagProps {
  tag: string;
  lang: string;
}

export function Tag(props: TagProps) {
  const { tag, lang } = props;

  // Button (not a link): tags render inside post-card <Link>s, where a
  // nested <a> would be invalid HTML. Full navigation on purpose — this
  // takes the user to the blog search page, pre-filtered by this tag.
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.assign(
      withLocalePath(lang, `blog?tags=${encodeURIComponent(tag)}`)
    );
  };

  return (
    <Badge asChild variant="default">
      <button
        type="button"
        onClick={handleClick}
        className="cursor-pointer hover:border-primary-700 hover:text-primary-800"
      >
        {getTagDisplayName(tag, lang)}
      </button>
    </Badge>
  );
}
