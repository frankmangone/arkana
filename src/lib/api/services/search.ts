import apiClient from "../client";

export interface SearchHit {
  id: string;
  lang: string;
  path: string;
  title: string;
  description: string;
  tags: string[];
  excerpt: string;
  thumbnail: string;
}

export interface SearchResponse {
  query: string;
  estimatedTotalHits: number;
  hits: SearchHit[];
}

export interface TagHit {
  tag: string;
  count: number;
}

export interface TagSearchResponse {
  query: string;
  tags: TagHit[];
}

export interface UnifiedSearchParams {
  /** Free-text query. Optional if one or more tags are given. */
  query?: string;
  /** Tags to filter by. Optional if a query is given. */
  tags?: string[];
  /** true: posts must carry every tag; false: any of them. */
  matchAll?: boolean;
  lang: string;
  limit: number;
}

/**
 * Unified search: a free-text query, a tag filter, or both together (the
 * backend only requires that at least one of the two is present).
 */
export async function searchPostsUnified({
  query,
  tags,
  matchAll = true,
  lang,
  limit,
}: UnifiedSearchParams): Promise<SearchResponse> {
  const params = new URLSearchParams({ lang, limit: String(limit) });
  if (query) params.set("q", query);
  if (tags && tags.length > 0) {
    params.set("tags", tags.join(","));
    params.set("match", matchAll ? "all" : "any");
  }
  const response = await apiClient.get<SearchResponse>(
    `/api/search?${params.toString()}`
  );
  return response.data;
}

/**
 * Tag type-ahead over the language's index. An empty query returns the
 * most-used tags.
 */
export async function searchTags(
  query: string,
  lang: string
): Promise<TagSearchResponse> {
  const params = new URLSearchParams({ q: query, lang });
  const response = await apiClient.get<TagSearchResponse>(
    `/api/search/tags?${params.toString()}`
  );
  return response.data;
}
