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

/**
 * Full-text search over published posts.
 *
 * @param query - The search term
 * @param lang - Language index to search (en/es/pt)
 * @param limit - Maximum number of hits to return
 */
export async function searchPosts(
  query: string,
  lang: string,
  limit: number
): Promise<SearchResponse> {
  const params = new URLSearchParams({
    q: query,
    lang,
    limit: String(limit),
  });
  const response = await apiClient.get<SearchResponse>(
    `/api/search?${params.toString()}`
  );
  return response.data;
}

/**
 * All posts carrying every one of the given tags (placeholder search —
 * no text query).
 */
export async function searchPostsByTags(
  tags: string[],
  lang: string,
  limit: number
): Promise<SearchResponse> {
  const params = new URLSearchParams({
    tags: tags.join(","),
    match: "all",
    lang,
    limit: String(limit),
  });
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
