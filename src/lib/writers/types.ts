export interface Writer {
  slug: string;
  name: string;
  imageUrl: string;
  avatarUrl: string;
  bio?: Record<string, string>;
  website?: string;
  twitter?: string;
  github?: string;
}
