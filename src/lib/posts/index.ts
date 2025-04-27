import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";

export interface PostPreview {
  slug: string;
  title: string;
  date: string;
  description: string;
  author: string;
  tags: string[];
  readingTime?: string;
}

// Function to get posts by author for a specific language
export async function getPostsByAuthor(
  authorSlug: string,
  lang: string
): Promise<PostPreview[]> {
  const contentPath = path.join(process.cwd(), "src", "content", lang);
  const allPosts: PostPreview[] = [];

  try {
    // Function to process files in a directory
    const processDirectory = async (dirPath: string, baseSlug = "") => {
      const files = await fs.readdir(dirPath);

      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stat = await fs.stat(filePath);

        if (stat.isDirectory()) {
          // If it's a directory, process its files with the directory name as a prefix
          await processDirectory(filePath, file);
        } else if (file.endsWith(".md")) {
          // If it's a markdown file
          const slug = file.replace(".md", "");
          const fullSlug = baseSlug ? `${baseSlug}/${slug}` : slug;

          const fileContent = await fs.readFile(filePath, "utf8");
          const { data } = matter(fileContent);

          // Only include posts by the specified author
          if (data.author === authorSlug) {
            allPosts.push({
              slug: fullSlug,
              title: data.title || "Untitled",
              date: data.date || new Date().toISOString(),
              description: data.description || "",
              author: data.author || "Unknown",
              tags: data.tags || [],
              readingTime: data.readingTime || "",
            });
          }
        }
      }
    };

    // Start processing from the language directory
    await processDirectory(contentPath);

    // Sort posts by date (newest first)
    return allPosts.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch (error) {
    console.error(`Error getting posts for ${lang}:`, error);
    return [];
  }
}

// Function to get all posts for a specific language
export async function getAllPosts(lang: string): Promise<PostPreview[]> {
  const contentPath = path.join(process.cwd(), "src", "content", lang);
  const allPosts: PostPreview[] = [];

  try {
    // Function to process files in a directory
    const processDirectory = async (dirPath: string, baseSlug = "") => {
      const files = await fs.readdir(dirPath);

      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stat = await fs.stat(filePath);

        if (stat.isDirectory()) {
          // If it's a directory, process its files with the directory name as a prefix
          await processDirectory(filePath, file);
        } else if (file.endsWith(".md")) {
          // If it's a markdown file
          const slug = file.replace(".md", "");
          const fullSlug = baseSlug ? `${baseSlug}/${slug}` : slug;

          const fileContent = await fs.readFile(filePath, "utf8");
          const { data } = matter(fileContent);

          allPosts.push({
            slug: fullSlug,
            title: data.title || "Untitled",
            date: data.date || new Date().toISOString(),
            description: data.description || "",
            author: data.author || "Unknown",
            tags: data.tags || [],
            readingTime: data.readingTime || "",
          });
        }
      }
    };

    // Start processing from the language directory
    await processDirectory(contentPath);

    // Sort posts by date (newest first)
    return allPosts.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch (error) {
    console.error(`Error getting posts for ${lang}:`, error);
    return [];
  }
}
