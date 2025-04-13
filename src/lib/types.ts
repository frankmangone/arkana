export interface Post {
  id: string;
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  tags: string[];
  author: {
    name: string;
    image?: string;
  };
  readingTime: number;
  likes?: number;
  featured?: boolean;
}

export interface ReadingList {
  id: string;
  title: string;
  description?: string;
  posts: Post[];
}
