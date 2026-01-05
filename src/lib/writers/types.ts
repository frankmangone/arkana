export interface Writer {
  slug: string;
  name: string;
  imageUrl: string;
  avatarUrl: string;
  visible?: boolean;
  organization?: {
    name: string;
    url: string;
    logoUrl?: string;
  };
  bio?: Record<string, string>;
  social?: {
    website?: string;
    twitter?: string;
    linkedin?: string;
    github?: string;
    email?: string;
    medium?: string;
  };
  walletAddress?: string;
}

