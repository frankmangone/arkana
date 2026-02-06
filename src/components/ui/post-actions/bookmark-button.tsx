import { Button } from "../button"
import BookmarkIcon from "./bookmark-icon";

export function BookmarkButton() {
  return (
    <Button
        variant="ghost"
        className="h-auto min-h-10 !px-4 !py-2 rounded-none cursor-pointer bg-background border border-border text-secondary-900 hover:!bg-accent hover:!border-secondary-700/50 flex items-center gap-2"
        aria-label="Bookmark post"
    >
        <BookmarkIcon size={16} filled={true} />
    </Button>
  );
}