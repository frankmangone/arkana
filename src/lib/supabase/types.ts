export interface HeadingStructure {
  level: number;
  text: string;
  slug: string;
}

export interface Database {
  public: {
    Tables: {
      articles: {
        Row: {
          id: number;
          created_at: string;
          slug: string;
          title: string;
          language: string;
          author_slug: string;
          uuid: string;
          search_keywords: string | null;
          search_headings: string | null;
          search_tags_expanded: string | null;
          headings_structure: HeadingStructure[] | null;
          word_count: number | null;
          search_summary: string | null;
        };
        Insert: {
          id?: number;
          created_at?: string;
          slug: string;
          title: string;
          language: string;
          author_slug: string;
          uuid?: string;
          search_keywords?: string | null;
          search_headings?: string | null;
          search_tags_expanded?: string | null;
          headings_structure?: HeadingStructure[] | null;
          word_count?: number | null;
          search_summary?: string | null;
        };
        Update: {
          id?: number;
          created_at?: string;
          slug?: string;
          title?: string;
          language?: string;
          author_slug?: string;
          uuid?: string;
          search_keywords?: string | null;
          search_headings?: string | null;
          search_tags_expanded?: string | null;
          headings_structure?: HeadingStructure[] | null;
          word_count?: number | null;
          search_summary?: string | null;
        };
      };
      search_analytics: {
        Row: {
          id: string;
          query: string;
          results_count: number;
          user_id: string | null;
          searched_at: string;
        };
        Insert: {
          id?: string;
          query: string;
          results_count: number;
          user_id?: string | null;
          searched_at?: string;
        };
        Update: {
          id?: string;
          query?: string;
          results_count?: number;
          user_id?: string | null;
          searched_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          bio: string | null;
          website: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          website?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          website?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
