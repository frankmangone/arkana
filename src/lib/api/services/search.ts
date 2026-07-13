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
