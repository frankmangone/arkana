import type { Post } from "@/lib/types";
import { KeyConceptsTrigger } from "@/components/ui/key-concepts-modal";
import { ARKANA_PURPLE, KeySigils } from "@/components/ui/key-sigils";
import { splitKeyConcepts } from "./validate-key-concepts";

interface KeyConceptsRecapProps {
  post: Post;
  /** The translated strings: the button's label, and the card's heading and text. */
  dictionary: { title: string; recapTitle: string; recapText: string };
}

/**
 * A card for the end of the article, offering the key concepts. It goes after
 * the "Article finished!" marker. A bare button looked lost there, and a
 * separator of its own would stack with that marker's rules.
 */
export function KeyConceptsRecap({ post, dictionary }: KeyConceptsRecapProps) {
  const { deck } = splitKeyConcepts(post.content, post.metadata?.title);
  if (!deck) return null;

  return (
    <aside
      // Styled like the cards in the deck itself.
      className="mx-auto mb-10 mt-4 flex max-w-xl flex-col items-center gap-3 rounded-[3px] border bg-[color-mix(in_srgb,var(--primary-600)_8%,var(--surface-page))] px-6 py-8 text-center sm:px-10"
      style={{ borderColor: ARKANA_PURPLE }}
    >
      <KeySigils className="h-8 w-16" />
      <p className="text-lg font-semibold text-ink-heading">
        {dictionary.recapTitle}
      </p>
      <p className="mb-2 max-w-[38ch] text-ink-body">{dictionary.recapText}</p>
      <KeyConceptsTrigger label={dictionary.title} variant="recap" />
    </aside>
  );
}
