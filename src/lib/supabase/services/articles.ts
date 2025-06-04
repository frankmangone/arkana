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
  author?: string;
  thumbnail?: string;
  relevance_score?: number;
}

export interface SearchOptions {
  language: string;
  limit?: number;
  searchType?: "full_text" | "similarity" | "exact" | "ranked" | "hybrid";
  includeContent?: boolean;
}

export const articlesService = {
  // Enhanced search with multiple strategies
  async searchArticles(
    searchTerm: string,
    options: SearchOptions
  ): Promise<ArticleListItem[]> {
    const { language, limit = 10, searchType = "ranked" } = options;

    if (!searchTerm?.trim()) {
      return [];
    }

    const cleanSearchTerm = searchTerm.trim();

    try {
      switch (searchType) {
        case "full_text":
          return await this.fullTextSearch(cleanSearchTerm, language, limit);
        case "similarity":
          return await this.similaritySearch(cleanSearchTerm, language, limit);
        case "exact":
          return await this.exactSearch(cleanSearchTerm, language, limit);
        case "ranked":
          return await this.rankedFullTextSearch(
            cleanSearchTerm,
            language,
            limit
          );
        case "hybrid":
        default:
          return await this.hybridRankedSearch(
            cleanSearchTerm,
            language,
            limit
          );
      }
    } catch (err) {
      console.error("❌ Search method failed:", err);
      throw err;
    }
  },

  // Enhanced search using proven fields
  async fullTextSearch(
    searchTerm: string,
    language: string,
    limit: number
  ): Promise<ArticleListItem[]> {
    const selectFields =
      "slug, title, search_summary, language, word_count, author, thumbnail";

    // Search across title and summary fields
    const { data, error } = await supabase
      .from("articles")
      .select(selectFields)
      .or(`title.ilike.%${searchTerm}%,search_summary.ilike.%${searchTerm}%`)
      .eq("language", language)
      .limit(limit)
      .order("created_at", { ascending: false });

    if (data) {
      console.log("🔍 First few results:", data.slice(0, 3));
    }

    if (error) {
      console.error("❌ Full-text search failed:", error);
      throw error;
    }

    return data || [];
  },

  // Full-text search with PostgreSQL ranking (RECOMMENDED)
  async rankedFullTextSearch(
    searchTerm: string,
    language: string,
    limit: number
  ): Promise<ArticleListItem[]> {
    const selectFields =
      "slug, title, search_summary, language, word_count, author, thumbnail";

    // First get all potential matches
    const { data, error } = await supabase
      .from("articles")
      .select(selectFields)
      .or(`title.ilike.%${searchTerm}%,search_summary.ilike.%${searchTerm}%`)
      .eq("language", language)
      .limit(limit * 2); // Get more results to rank

    if (error) {
      console.error("❌ Ranked search failed:", error);
      return await this.fullTextSearch(searchTerm, language, limit);
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Calculate relevance score for each result
    const rankedResults = data
      .map((article) => {
        let score = 0;
        const searchLower = searchTerm.toLowerCase();
        const titleLower = article.title.toLowerCase();
        const summaryLower = article.search_summary.toLowerCase();

        // Title exact match (highest priority)
        if (titleLower.includes(searchLower)) {
          score += 10;
          // Bonus for exact title match
          if (titleLower === searchLower) score += 15;
          // Bonus for title starting with search term
          if (titleLower.startsWith(searchLower)) score += 8;
        }

        // Summary matches
        if (summaryLower.includes(searchLower)) {
          score += 3;
        }

        // Word boundary matches (more precise)
        const wordBoundaryRegex = new RegExp(
          `\\b${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
          "i"
        );
        if (wordBoundaryRegex.test(article.title)) score += 5;
        if (wordBoundaryRegex.test(article.search_summary)) score += 2;

        // Multiple word matches
        const searchWords = searchTerm.toLowerCase().split(/\s+/);
        searchWords.forEach((word) => {
          if (word.length > 2) {
            // Skip very short words
            if (titleLower.includes(word)) score += 2;
            if (summaryLower.includes(word)) score += 1;
          }
        });

        return {
          ...article,
          relevance_score: score,
        };
      })
      .filter((article) => article.relevance_score > 0) // Only include matches
      .sort((a, b) => b.relevance_score - a.relevance_score) // Sort by relevance
      .slice(0, limit); // Take top results

    return rankedResults;
  },

  // Similarity search using fuzzy matching
  async similaritySearch(
    searchTerm: string,
    language: string,
    limit: number
  ): Promise<ArticleListItem[]> {
    const selectFields =
      "slug, title, search_summary, language, word_count, author, thumbnail";

    // Fuzzy search in title and summary
    const { data, error } = await supabase
      .from("articles")
      .select(selectFields)
      .or(`title.ilike.%${searchTerm}%,search_summary.ilike.%${searchTerm}%`)
      .eq("language", language)
      .limit(limit)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Similarity search failed:", error);
      throw error;
    }

    return data || [];
  },

  // Exact phrase search
  async exactSearch(
    searchTerm: string,
    language: string,
    limit: number
  ): Promise<ArticleListItem[]> {
    const selectFields =
      "slug, title, search_summary, language, word_count, author, thumbnail";

    // Exact matching with LIKE (case-sensitive)
    const { data, error } = await supabase
      .from("articles")
      .select(selectFields)
      .or(`title.like.%${searchTerm}%,search_summary.like.%${searchTerm}%`)
      .eq("language", language)
      .limit(limit)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Exact search failed:", error);
      throw error;
    }

    return data || [];
  },

  // Hybrid search with multiple approaches and relevance scoring
  async hybridRankedSearch(
    searchTerm: string,
    language: string,
    limit: number
  ): Promise<ArticleListItem[]> {
    const selectFields =
      "slug, title, search_summary, language, word_count, author, thumbnail";

    // Multi-tier search strategy with broader reach
    const searches = [
      // 1. Exact title matches (highest priority)
      supabase
        .from("articles")
        .select(selectFields)
        .ilike("title", `%${searchTerm}%`)
        .eq("language", language)
        .limit(Math.ceil(limit * 1.5)),

      // 2. Summary search (medium priority)
      supabase
        .from("articles")
        .select(selectFields)
        .ilike("search_summary", `%${searchTerm}%`)
        .eq("language", language)
        .limit(limit * 2),

      // 3. Combined search (broad match)
      supabase
        .from("articles")
        .select(selectFields)
        .or(`title.ilike.%${searchTerm}%,search_summary.ilike.%${searchTerm}%`)
        .eq("language", language)
        .limit(limit * 2),
    ];

    try {
      const results = await Promise.all(searches);
      const allArticles: ArticleListItem[] = [];
      const seenSlugs = new Set<string>();

      // Merge results and calculate comprehensive relevance scores
      results.forEach((result, searchIndex) => {
        if (result.error) {
          console.warn(`Search tier ${searchIndex + 1} failed:`, result.error);
          return;
        }

        if (result.data) {
          result.data.forEach((article) => {
            if (!seenSlugs.has(article.slug)) {
              seenSlugs.add(article.slug);

              // Calculate detailed relevance score
              let score = 0;
              const searchLower = searchTerm.toLowerCase();
              const titleLower = article.title.toLowerCase();
              const summaryLower = article.search_summary.toLowerCase();

              // Base tier score (which search found it)
              score += (3 - searchIndex) * 2;

              // Content-based scoring
              if (titleLower.includes(searchLower)) {
                score += 15;
                if (titleLower === searchLower) score += 10; // Exact match bonus
                if (titleLower.startsWith(searchLower)) score += 5; // Starts with bonus
              }

              if (summaryLower.includes(searchLower)) {
                score += 5;
              }

              // Word boundary matches
              const wordBoundaryRegex = new RegExp(
                `\\b${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
                "i"
              );
              if (wordBoundaryRegex.test(article.title)) score += 8;
              if (wordBoundaryRegex.test(article.search_summary)) score += 3;

              // Multiple word scoring
              const searchWords = searchTerm.toLowerCase().split(/\s+/);
              searchWords.forEach((word) => {
                if (word.length > 2) {
                  if (titleLower.includes(word)) score += 3;
                  if (summaryLower.includes(word)) score += 1;
                }
              });

              const enhancedArticle: ArticleListItem = {
                ...article,
                relevance_score: score,
              };
              allArticles.push(enhancedArticle);
            }
          });
        }
      });

      // Sort by comprehensive relevance score
      return allArticles
        .filter((article) => article.relevance_score! > 0)
        .sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0))
        .slice(0, limit);
    } catch (error) {
      console.error("❌ Hybrid ranked search failed:", error);
      // Fallback to simple ranked search
      return await this.rankedFullTextSearch(searchTerm, language, limit);
    }
  },

  // Advanced search with filters and sorting
  async advancedSearch(options: {
    searchTerm?: string;
    language: string;
    tags?: string[];
    author?: string;
    minWordCount?: number;
    maxWordCount?: number;
    sortBy?: "relevance" | "date" | "word_count" | "title";
    sortOrder?: "asc" | "desc";
    limit?: number;
  }) {
    const {
      searchTerm,
      language,
      tags,
      author,
      minWordCount,
      maxWordCount,
      sortBy = "relevance",
      sortOrder = "desc",
      limit = 20,
    } = options;

    let query = supabase
      .from("articles")
      .select(
        "slug, title, search_summary, language, word_count, author_slug, created_at"
      )
      .eq("language", language);

    // Apply text search if provided
    if (searchTerm?.trim()) {
      query = query.or(
        `search_keywords.fts.${searchTerm},search_summary.fts.${searchTerm},title.fts.${searchTerm}`
      );
    }

    // Apply filters
    if (tags && tags.length > 0) {
      const tagFilter = tags
        .map((tag) => `search_tags_expanded.ilike.%${tag}%`)
        .join(",");
      query = query.or(tagFilter);
    }

    if (author) {
      query = query.eq("author_slug", author);
    }

    if (minWordCount !== undefined) {
      query = query.gte("word_count", minWordCount);
    }

    if (maxWordCount !== undefined) {
      query = query.lte("word_count", maxWordCount);
    }

    // Apply sorting
    switch (sortBy) {
      case "date":
        query = query.order("created_at", { ascending: sortOrder === "asc" });
        break;
      case "word_count":
        query = query.order("word_count", { ascending: sortOrder === "asc" });
        break;
      case "title":
        query = query.order("title", { ascending: sortOrder === "asc" });
        break;
      case "relevance":
      default:
        // For relevance, we'll sort by created_at as a fallback
        query = query.order("created_at", { ascending: false });
        break;
    }

    query = query.limit(limit);

    const { data, error } = await query;

    if (error) {
      console.error("❌ Advanced search failed:", error);
      throw error;
    }

    return data as ArticleListItem[];
  },

  // Backward compatibility - simple search method
  async simpleSearch(searchTerm: string, currentLanguage: string, limit = 10) {
    return await this.searchArticles(searchTerm, {
      language: currentLanguage,
      limit,
      searchType: "ranked",
    });
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

  // Get related articles based on shared keywords/tags
  async getRelatedArticles(articleSlug: string, language: string, limit = 5) {
    try {
      // First get the current article's keywords and tags
      const { data: currentArticle } = await supabase
        .from("articles")
        .select("search_keywords, search_tags_expanded")
        .eq("slug", articleSlug)
        .eq("language", language)
        .single();

      if (!currentArticle?.search_keywords) {
        return [];
      }

      // Extract key terms from the current article
      const keywords = currentArticle.search_keywords.split(" ").slice(0, 10); // Top 10 keywords
      const searchTerms = keywords.join(" | "); // OR search

      const { data, error } = await supabase
        .from("articles")
        .select(
          "slug, title, search_summary, language, word_count, author, thumbnail"
        )
        .neq("slug", articleSlug) // Exclude current article
        .eq("language", language)
        .or(
          `search_keywords.fts.${searchTerms},search_tags_expanded.fts.${searchTerms}`
        )
        .limit(limit);

      if (error) {
        console.error("❌ Related articles search failed:", error);
        return [];
      }

      return data as ArticleListItem[];
    } catch (err) {
      console.error("❌ Failed to get related articles:", err);
      return [];
    }
  },
};
