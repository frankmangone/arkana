export interface ReadingListItem {
  id: string;
  slug: string;
  order?: number;
  description?: string;
}

export interface ReadingListModule {
  id: string;
  title: string;
  description: string;
  items: ReadingListItem[];
}

export interface ReadingList {
  id: string;
  title: string;
  description: string;
  modules: ReadingListModule[];
  /** Flattened items across all modules, in module-then-item order. Kept for existing consumers (navigation, sitemap, static params) that don't need module grouping. */
  items: ReadingListItem[];
  coverImage?: string;
  ongoing?: boolean;
}
