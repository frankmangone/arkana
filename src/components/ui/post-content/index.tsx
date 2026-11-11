import { Post } from "@/lib/types";
import React from "react";
import { PostMarkdown, resolveHiddenPostKeys } from "./post-markdown";
import { splitKeyConcepts } from "./validate-key-concepts";
import { SectionDivider } from "@/components/ui/section-divider";
import { TableOfContents } from "@/components/ui/table-of-contents";
import { HashScrollFix } from "@/components/ui/hash-scroll-fix";
import { KeyConceptsTrigger } from "@/components/ui/key-concepts-modal";

import { QuizDictionary } from "@/components/ui/quiz/types";

interface PostContentProps {
  post: Post;
  quizDictionary?: QuizDictionary;
  /** Text (translated) of the button at the top that opens the key-concepts deck. */
  tldrLabel?: string;
}

export async function PostContent({
  post,
  quizDictionary,
  tldrLabel,
}: PostContentProps) {
  // The key-concepts deck is shown in a modal (see PostHeader), so only the
  // article text is rendered here, plus the button that opens it. Throws,
  // failing the build, if the deck isn't the last block of the post.
  const { body, deck } = splitKeyConcepts(post.content, post.metadata?.title);
  const hiddenPostKeys = await resolveHiddenPostKeys(post);
  // The button's label, if this post has a deck to open.
  const tldr = deck && tldrLabel ? tldrLabel : null;

  return (
    <div
      data-post-body
      className="prose prose-gray dark:prose-invert relative max-w-none mb-8"
    >
      <HashScrollFix />
      {/* Sticky contents rail in the right margin on wide screens */}
      <div className="hidden xl:block absolute left-full top-0 bottom-0 ml-10 w-52">
        <div className="sticky top-24">
          <TableOfContents content={body} compact />
        </div>
      </div>
      {/* With a key-concepts deck, the first separator holds the button that
          opens it, and comes before the contents box on small screens. */}
      {tldr && (
        <SectionDivider>
          <KeyConceptsTrigger label={tldr} />
        </SectionDivider>
      )}
      <div className="xl:hidden">
        <TableOfContents content={body} />
      </div>
      {!tldr && <SectionDivider />}
      <PostMarkdown
        content={body}
        hiddenPostKeys={hiddenPostKeys}
        quizDictionary={quizDictionary}
      />
    </div>
  );
}
