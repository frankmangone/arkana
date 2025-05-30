import { supabase } from "../client";

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  slug: string;
  author: string;
  tags: string[];
  date: string;
  thumbnail?: string;
  description?: string;
  readingTime?: string;
  relevance_score?: number;
}

export const search = {
  // Full text search across blog posts
  async searchPosts(query: string, limit = 10) {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .textSearch("title,content,description", query)
      .limit(limit)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as SearchResult[];
  },

  // Search by tags
  async searchByTags(tags: string[], limit = 10) {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .contains("tags", tags)
      .limit(limit)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as SearchResult[];
  },

  // Search by author
  async searchByAuthor(author: string, limit = 10) {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("author", author)
      .limit(limit)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as SearchResult[];
  },

  // Advanced search with filters
  async advancedSearch({
    query,
    tags,
    author,
    dateFrom,
    dateTo,
    limit = 20,
  }: {
    query?: string;
    tags?: string[];
    author?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
  }) {
    let queryBuilder = supabase.from("posts").select("*");

    if (query) {
      queryBuilder = queryBuilder.textSearch(
        "title,content,description",
        query
      );
    }

    if (tags && tags.length > 0) {
      queryBuilder = queryBuilder.contains("tags", tags);
    }

    if (author) {
      queryBuilder = queryBuilder.eq("author", author);
    }

    if (dateFrom) {
      queryBuilder = queryBuilder.gte("date", dateFrom);
    }

    if (dateTo) {
      queryBuilder = queryBuilder.lte("date", dateTo);
    }

    const { data, error } = await queryBuilder
      .limit(limit)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as SearchResult[];
  },

  // Get popular/trending posts
  async getTrendingPosts(limit = 5) {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("views", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as SearchResult[];
  },

  // Get related posts based on tags
  async getRelatedPosts(postId: string, tags: string[], limit = 3) {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .neq("id", postId)
      .overlaps("tags", tags)
      .limit(limit)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as SearchResult[];
  },

  // Record search analytics
  async recordSearch(query: string, resultsCount: number, userId?: string) {
    const { data, error } = await supabase.from("search_analytics").insert({
      query,
      results_count: resultsCount,
      user_id: userId,
      searched_at: new Date().toISOString(),
    });

    if (error) throw error;
    return data;
  },
};
