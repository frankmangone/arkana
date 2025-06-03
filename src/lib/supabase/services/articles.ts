import { supabase } from "../client";
import type { HeadingStructure } from "../types";

export interface Article {
  id: number;
  uuid: string;
  slug: string;
  title: string;
  language: string;
  author_slug: string;
  created_at: string;
  search_keywords: string | null;
  search_headings: string | null;
  search_summary: string | null;
  search_tags_expanded: string | null;
  headings_structure: HeadingStructure[] | null;
  word_count: number | null;
}

export interface ArticleListItem {
  slug: string;
  title: string;
  search_summary: string;
  language: string;
  word_count: number | null;
}

export const articlesService = {
  // Search articles with enhanced search capabilities
  async searchArticles(
    searchTerm: string,
    currentLanguage: string,
    limit = 10
  ) {
    try {
      // Use the new search_keywords field for better search
      const { data, error } = await supabase
        .from("articles")
        .select("slug, title, search_summary, language, word_count")
        .or(
          `search_keywords.ilike.%${searchTerm}%,search_tags_expanded.ilike.%${searchTerm}%,title.ilike.%${searchTerm}%`
        )
        .eq("language", currentLanguage)
        .limit(limit)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Search failed:", error);
        throw error;
      }

      return data as ArticleListItem[];
    } catch (err) {
      console.error("❌ Search method failed:", err);
      throw err;
    }
  },

  // Get article by slug
  async getArticleBySlug(slug: string, language: string) {
    try {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("slug", slug)
        .eq("language", language)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null; // Not found
        }
        throw error;
      }

      return data as Article;
    } catch (err) {
      console.error("❌ Failed to get article:", err);
      throw err;
    }
  },
};
