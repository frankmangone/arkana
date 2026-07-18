import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  searchPostsUnified,
  searchTags,
  SearchResponse,
  TagSearchResponse,
} from "../services/search";

interface UseTagSearchParams {
  query: string;
  lang: string;
  enabled: boolean;
}

/**
 * Tag type-ahead. An empty query is valid (returns the most-used tags), so
 * fetching is gated by the caller via `enabled` (e.g. only while the tag
 * input is focused).
 */
export function useTagSearch({ query, lang, enabled }: UseTagSearchParams) {
  return useQuery<TagSearchResponse, Error>({
    queryKey: ["tag-search", lang, query],
    queryFn: () => searchTags(query, lang),
    enabled,
    placeholderData: keepPreviousData,
  });
}

interface UseUnifiedSearchParams {
  query: string;
  tags: string[];
  lang: string;
  limit?: number;
}

/**
 * Posts matching a free-text query, a tag filter, or both. Disabled when
 * neither is set — the caller renders its static post list instead.
 */
export function useUnifiedSearch({
  query,
  tags,
  lang,
  limit = 50,
}: UseUnifiedSearchParams) {
  const trimmedQuery = query.trim();

  return useQuery<SearchResponse, Error>({
    queryKey: ["unified-search", lang, trimmedQuery, tags, limit],
    queryFn: () =>
      searchPostsUnified({ query: trimmedQuery, tags, lang, limit }),
    enabled: trimmedQuery.length > 0 || tags.length > 0,
    placeholderData: keepPreviousData,
    retry: 1,
  });
}
