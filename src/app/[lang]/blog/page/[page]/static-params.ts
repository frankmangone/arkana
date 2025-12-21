import { getAllPosts } from "@/lib/posts";

export const POSTS_PER_PAGE = 9; // 3x3 grid

export async function generateStaticParams() {
  // Get all languages
  const allPosts = await getAllPosts("en"); // Use English as reference for total count
  const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);

  // Generate all possible language + page combinations
  const languages = ["en", "es", "pt"]; // Add all your supported languages
  const params = [];

  for (const lang of languages) {
    for (let page = 1; page <= totalPages; page++) {
      params.push({ lang, page: page.toString() });
    }
  }

  return params;
}

