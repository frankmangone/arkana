import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import {
  searchPostsUnified,
  searchTags,
  SearchResponse,
  TagSearchResponse,
} from "../services/search";

const SEARCH_PAGE_SIZE = 12;

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
}

/**
 * Posts matching a free-text query, a tag filter, or both, paged 12 at a
 * time via offset. Disabled when neither query nor tags is set — the caller
 * renders its static post list instead.
 */
export function useUnifiedSearch({ query, tags, lang }: UseUnifiedSearchParams) {
  const trimmedQuery = query.trim();

  return useInfiniteQuery<SearchResponse, Error>({
    queryKey: ["unified-search", lang, trimmedQuery, tags],
    queryFn: ({ pageParam }) =>
      searchPostsUnified({
        query: trimmedQuery,
        tags,
        lang,
        limit: SEARCH_PAGE_SIZE,
        offset: pageParam as number,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const fetchedSoFar = allPages.reduce(
        (sum, page) => sum + page.hits.length,
        0
      );
      return fetchedSoFar < lastPage.estimatedTotalHits
        ? fetchedSoFar
        : undefined;
    },
    enabled: trimmedQuery.length > 0 || tags.length > 0,
    placeholderData: keepPreviousData,
    retry: 1,
  });
}
