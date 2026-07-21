"use client";

import { useEffect, useState } from "react";
import { withLocalePath } from "@/lib/site-config";

type PostTitles = Record<string, string>;

const cache = new Map<string, Promise<PostTitles>>();

function fetchPostTitles(lang: string): Promise<PostTitles> {
  let promise = cache.get(lang);
  if (!promise) {
    promise = fetch(withLocalePath(lang, "post-titles.json"))
      .then((response) => (response.ok ? response.json() : {}))
      .catch(() => ({}));
    cache.set(lang, promise);
  }
  return promise;
}

/**
 * Maps a post's path_identifier to its title, read from the static
 * per-locale post-titles.json built from markdown frontmatter. Fetched
 * once per lang and cached across component instances.
 */
export function usePostTitles(lang: string): PostTitles {
  const [titles, setTitles] = useState<PostTitles>({});

  useEffect(() => {
    let active = true;

    fetchPostTitles(lang).then((value) => {
      if (active) {
        setTitles(value);
      }
    });

    return () => {
      active = false;
    };
  }, [lang]);

  return titles;
}
