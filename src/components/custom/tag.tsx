import { getTagDisplayName } from "@/lib/tags";
import { Badge } from "../ui/badge";

interface TagProps {
  tag: string;
  lang: string;
}

export function Tag(props: TagProps) {
  const { tag, lang } = props;

  // Disable link for now

  return (
    // <Link key={tag} href={`/${lang}/blog?tag=${tag}`}>
    <Badge variant="default" className="rounded-none">
      {getTagDisplayName(tag, lang)}
    </Badge>
    // </Link>
  );
}
