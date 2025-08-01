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
    <div className="flex flex-col md:flex-row gap-4 justify-between items-center mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
      <PrevButton lang={lang} id={id} prevItem={prevItem} />
      <NextButton lang={lang} id={id} nextItem={nextItem} />
    </div>
  );
}
