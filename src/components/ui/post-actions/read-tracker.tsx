"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { usePostInfo, useToggleRead } from "@/lib/api/hooks/usePosts";
import { useDictionary } from "@/lib/hooks/use-dictionary";
import { CompletionAnimation } from "./completion-animation";

interface ReadTrackerProps {
  path: string;
}

/**
 * Sentinel placed right after the article body. Once it scrolls into view
 * (fires once per mount) it shows a completion animation for everyone,
 * guest or logged in, and — only when logged in and not already read —
 * silently marks the post as read in the background.
 */
export function ReadTracker({ path }: ReadTrackerProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const firedRef = useRef(false);
  const [completed, setCompleted] = useState(false);
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const dictionary = useDictionary(lang);

  const { user } = useAuth();
  const { data: postInfo } = usePostInfo({ path, userId: user?.id });
  const readMutation = useToggleRead();

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || firedRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || firedRef.current) return;
        firedRef.current = true;
        observer.disconnect();
        setCompleted(true);

        // toggleRead flips whatever the server currently has, so only call
        // it once we've confirmed (via a resolved query) the post is unread.
        if (user && postInfo && !postInfo.read) {
          readMutation.mutate({ path, read: false });
        }
      },
      { threshold: 0 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [user, postInfo, path, readMutation]);

  return (
    <div ref={sentinelRef}>
      {completed && (
        <CompletionAnimation
          label={dictionary?.blog.articleFinished || "Article finished!"}
        />
      )}
    </div>
  );
}
