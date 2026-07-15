import { PrevButton } from "./prev-button";
import { NextButton } from "./next-button";
import { ReadingListItem } from "@/lib/reading-lists";

interface NavigationProps {
  lang: string;
  id: string;
  prevItem?: ReadingListItem | null;
  nextItem?: ReadingListItem | null;
}

export function Navigation(props: NavigationProps) {
  const { lang, id, prevItem, nextItem } = props;

  if (!prevItem && !nextItem) {
    return null;
  }

  return (
    <nav className="mt-14 grid gap-4 md:grid-cols-2">
      <PrevButton lang={lang} id={id} prevItem={prevItem} />
      <NextButton lang={lang} id={id} nextItem={nextItem} />
    </nav>
  );
}
