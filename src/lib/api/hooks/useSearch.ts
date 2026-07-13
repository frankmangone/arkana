import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { searchPosts, SearchResponse } from "../services/search";

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
