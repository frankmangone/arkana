export interface ReadingListItem {
  slug: string;
  postPath: string;
  order?: number;
  description?: string;
}

export interface ReadingListModule {
  slug: string;
  title: string;
  description: string;
  items: ReadingListItem[];
}

export interface ReadingList {
  slug: string;
  title: string;
  description: string;
  modules: ReadingListModule[];
  /** Flattened items across all modules, in module-then-item order. Kept for existing consumers (navigation, sitemap, static params) that don't need module grouping. */
  items: ReadingListItem[];
  coverImage?: string;
  ongoing?: boolean;
}
