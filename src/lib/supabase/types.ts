export interface Database {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string;
          title: string;
          content: string;
          slug: string;
          author: string;
          tags: string[];
          date: string;
          thumbnail: string | null;
          description: string | null;
          reading_time: string | null;
          views: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          slug: string;
          author: string;
          tags: string[];
          date: string;
          thumbnail?: string | null;
          description?: string | null;
          reading_time?: string | null;
          views?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          slug?: string;
          author?: string;
          tags?: string[];
          date?: string;
          thumbnail?: string | null;
          description?: string | null;
          reading_time?: string | null;
          views?: number;
          created_at?: string;
          updated_at?: string;
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
