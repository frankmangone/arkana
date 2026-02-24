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
}

export interface HeadingStructure {
  level: number;
  text: string;
  slug: string;
}
