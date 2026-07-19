import { Button } from "../button"
import BookmarkIcon from "./bookmark-icon";

export function BookmarkButton() {
  return (
    <Button
        variant="ghost"
        className="h-auto min-h-10 !px-4 !py-2 rounded-[4px] cursor-pointer bg-transparent border border-rule text-ink-muted hover:!border-primary-700 hover:text-primary-800 flex items-center gap-2"
        aria-label="Bookmark post"
    >
        <BookmarkIcon size={16} filled={true} />
    </Button>
  );
}