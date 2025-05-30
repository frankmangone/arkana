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
    const { data, error } = await supabase
      .from("articles")
      .select("slug, title, excerpt, language")
      .textSearch("content", searchTerm)
      .eq("language", currentLanguage)
      .eq("published", true)
      .limit(limit)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as ArticleListItem[];
  },
};
