"use client";

import { useCallback, useState } from "react";
import { PostCard } from "@/components/ui/post-card";
import { ArkanaSpinner } from "@/components/ui/arkana-spinner";
import { EndOfFeed } from "@/components/ui/end-of-feed";
import {
  MasonryColumns,
  type MasonryBreakpoint,
} from "@/components/ui/masonry-columns";
import { useInfiniteScrollTrigger } from "@/hooks/use-infinite-scroll-trigger";
import { PostPreview } from "@/lib/posts";

const CHUNK_SIZE = 12;

interface InfiniteMasonryFeedProps {
  posts: PostPreview[];
  lang: string;
  /** Shown once every post has been loaded. */
  endMessage: string;
  breakpoints?: MasonryBreakpoint[];
}

export function InfiniteMasonryFeed({
  posts,
  lang,
  endMessage,
  breakpoints,
}: InfiniteMasonryFeedProps) {
  const [visibleCount, setVisibleCount] = useState(
    Math.min(CHUNK_SIZE, posts.length)
  );

  const hasMore = visibleCount < posts.length;

  const loadMore = useCallback(() => {
    setVisibleCount((count) => Math.min(count + CHUNK_SIZE, posts.length));
  }, [posts.length]);

  const sentinelRef = useInfiniteScrollTrigger(loadMore, hasMore);

  const shown = posts.slice(0, visibleCount);

  return (
    <>
      <MasonryColumns
        breakpoints={breakpoints}
        items={shown.map((post) => (
          <PostCard
            key={post.slug}
            post={post}
            lang={lang}
            clampDescription={false}
          />
        ))}
      />
      {hasMore ? (
        <div ref={sentinelRef} className="flex justify-center py-10">
          <ArkanaSpinner />
        </div>
      ) : (
        <EndOfFeed message={endMessage} />
      )}
    </>
  );
}
