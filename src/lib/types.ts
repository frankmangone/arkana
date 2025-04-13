export interface Post {
  content: string;
  metadata: PostMetadata;
}

export interface PostMetadata {
  title: string;
  date: string;
  author: string;
  tags: string[];
  image?: string;
  description?: string;
  readingTime?: string;
}
