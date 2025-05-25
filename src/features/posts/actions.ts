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
    // Handle nested paths with slashes
    let filePath;
    if (slug.includes("/")) {
      // For nested paths like "cryptography-101/where-to-start"
      const [folder, fileName] = slug.split("/");
      filePath = path.join(
        process.cwd(),
        "src/content",
        lang,
        folder,
        `${fileName}.md`
      );
    } else {
      // For flat files like "some-article"
      filePath = path.join(process.cwd(), "src/content", lang, `${slug}.md`);
    }

    const fileContent = await fs.readFile(filePath, "utf8");
    const { data, content: markdownContent } = matter(fileContent);

    // Return null if the post is marked as not visible
    if (data.visible === false) {
      return null;
    }

    return { content: markdownContent, metadata: data as PostMetadata };
  } catch (error) {
    // Try alternative path format if the first attempt fails
    try {
      // If direct path fails, check if it's a nested path that needs to be constructed
      if (!slug.includes("/")) {
        // Look for folders that match pattern
        const parts = slug.split("-");
        if (parts.length >= 2) {
          const potentialFolderName = `${parts[0]}-${parts[1]}`;
          const potentialFileName = parts.slice(2).join("-");

          if (potentialFileName) {
            const nestedPath = path.join(
              process.cwd(),
              "src/content",
              lang,
              potentialFolderName,
              `${potentialFileName}.md`
            );

            const fileContent = await fs.readFile(nestedPath, "utf8");
            const { data, content: markdownContent } = matter(fileContent);

            // Return null if the post is marked as not visible
            if (data.visible === false) {
              return null;
            }

            return { content: markdownContent, metadata: data as PostMetadata };
          }
        }
      }
    } catch {
      // Both attempts failed
      console.error(`Error loading markdown file for ${lang}/${slug}:`, error);
    }

    return null;
  }
};
