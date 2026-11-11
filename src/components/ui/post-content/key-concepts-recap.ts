import type { Post } from "@/lib/types";
import { splitKeyConcepts } from "./validate-key-concepts";

/**
 * The label of the end-of-article button that offers the key concepts, or
 * undefined if the post has no deck. It's decided here, on the server, because
 * the deck is parsed from the post's content; the button itself (see
 * FinishedRecap) is shown by ReadTracker, together with the "Article finished!"
 * mark.
 */
export function keyConceptsRecapLabel(
  post: Post,
  label: string
): string | undefined {
  const { deck } = splitKeyConcepts(post.content, post.metadata?.title);
  return deck ? label : undefined;
}
