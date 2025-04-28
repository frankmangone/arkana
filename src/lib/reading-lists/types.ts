export interface ReadingListItem {
  slug: string;
  order?: number;
  description?: string;
}

export interface ReadingList {
  id: string;
  title: string;
  description: string;
  items: ReadingListItem[];
  coverImage?: string;
  ongoing?: boolean;
}
