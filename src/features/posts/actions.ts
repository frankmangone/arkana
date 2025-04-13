import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import type { Post, PostMetadata } from "@/lib/types";

export const getPostBySlug = async (
  slug: string,
  lang: string
): Promise<Post | null> => {
  // Attempt to read the markdown file based on language and slug
  try {
    // Construct the file path to the markdown file
    const filePath = path.join(
      process.cwd(),
      "src/content",
      lang,
      `${slug}.md`
    );

    const fileContent = await fs.readFile(filePath, "utf8");
    const { data, content: markdownContent } = matter(fileContent);

    return { content: markdownContent, metadata: data as PostMetadata };
  } catch (error) {
    console.error(`Error loading markdown file for ${lang}/${slug}:`, error);
    return null;
  }
};
