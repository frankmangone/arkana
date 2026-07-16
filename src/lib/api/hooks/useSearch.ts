import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  searchPosts,
  searchPostsByTags,
  searchTags,
  SearchResponse,
  TagSearchResponse,
} from "../services/search";

interface UseSearchParams {
  query: string;
  lang: string;
  limit: number;
}

/**
 * Hook to search posts. Pass an already-debounced query; the request only
 * fires when the query is non-empty. Previous results are kept while a new
 * query is in flight so the results panel doesn't flicker between keystrokes.
 */
export function useSearch({ query, lang, limit }: UseSearchParams) {
  return useQuery<SearchResponse, Error>({
    queryKey: ["search", lang, query, limit],
    queryFn: () => searchPosts(query, lang, limit),
    enabled: query.trim().length > 0,
    placeholderData: keepPreviousData,
  });
}

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

interface UseTagFilteredPostsParams {
  tags: string[];
  lang: string;
}

/**
 * Posts carrying every selected tag. Disabled with no tags selected — the
 * caller renders its static post list instead.
 */
export function useTagFilteredPosts({ tags, lang }: UseTagFilteredPostsParams) {
  return useQuery<SearchResponse, Error>({
    queryKey: ["tag-posts", lang, tags],
    queryFn: () => searchPostsByTags(tags, lang, 50),
    enabled: tags.length > 0,
    placeholderData: keepPreviousData,
    retry: 1,
  });
}
