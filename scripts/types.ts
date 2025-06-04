export interface ExtractedData {
  title: string;
  author: string;
  date: string;
  description: string;
  tags: string[];
  thumbnail: string;
  search_keywords: string;
  search_summary: string;
  search_headings: string;
  search_tags_expanded: string;
  headings_structure: HeadingStructure[];
  word_count: number;
  content_hash: string;
  language: string;
  processed_at: string;
  source_file: string;
  supabaseId?: string;
}

export interface HeadingStructure {
  level: number;
  text: string;
  slug: string;
}

export interface ArticleData {
  title: string;
  slug: string;
  language: string;
  author: string;
  thumbnail: string;
  word_count: number;
  headings_structure: HeadingStructure[];
  search_keywords: string;
  search_summary: string;
  search_tags_expanded: string;
  search_headings: string;
  created_at?: string;
}

export interface SupabaseArticle extends ArticleData {
  id?: number;
  uuid?: string;
  author_slug?: string;
  created_at?: string;
}

export interface SyncResult {
  success: boolean;
  action?: "created" | "updated" | "skipped";
  data?: SupabaseArticle;
  uuid?: string;
  error?: Error | string | unknown;
  message?: string;
}

export interface SyncOptions {
  forceUpdate?: boolean;
}

export interface BulkSyncOptions {
  dryRun?: boolean;
  continueOnError?: boolean;
  delay?: number;
  forceUpdate?: boolean;
}

export interface BulkSyncResults {
  total: number;
  created: number;
  updated: number;
  skipped: number;
  failed: number;
  errors: Array<{ file: string; error: Error | string | unknown }>;
}
