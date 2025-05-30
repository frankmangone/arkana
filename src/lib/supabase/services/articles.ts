import { supabase } from "../client";

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  language: string;
  author: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  published: boolean;
}

export interface ArticleListItem {
  slug: string;
  title: string;
  excerpt: string;
  language: string;
}

export const articlesService = {
  // Search articles with text search and language filter
  async searchArticles(
    searchTerm: string,
    currentLanguage: string,
    limit = 10
  ) {
    // Option 1: Format search term for tsquery (words joined with &)
    const formattedSearchTerm = searchTerm
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0)
      .join(" & ");

    try {
      // Try with properly formatted tsquery first
      const { data, error } = await supabase
        .from("articles")
        .select("slug, title")
        .textSearch("content", formattedSearchTerm)
        .eq("language", currentLanguage)
        .limit(limit)
        .order("created_at", { ascending: false });

      if (error) {
        // Fallback: use ilike for simpler text matching
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("articles")
          .select("slug, title")
          .ilike("content", `%${searchTerm}%`)
          .eq("language", currentLanguage)
          .limit(limit)
          .order("created_at", { ascending: false });

        if (fallbackError) throw fallbackError;
        return fallbackData as ArticleListItem[];
      }

      return data as ArticleListItem[];
    } catch (err) {
      console.error("❌ All search methods failed:", err);
      throw err;
    }
  },
};
