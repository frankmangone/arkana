import { HomePage } from "@/features/home";
import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import Link from "next/link";
import { MainLayout } from "@/components/layouts/main-layout";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface HomeParams extends Promise<any> {
  lang: string;
}

interface HomeProps {
  params: HomeParams;
}

interface PostPreview {
  slug: string;
  title: string;
  date: string;
  description: string;
  author: string;
  tags: string[];
  readingTime?: string;
}

// Function to get latest posts for a specific language
async function getLatestPosts(lang: string, limit = 5): Promise<PostPreview[]> {
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
    const sortedPosts = allPosts.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Return only the requested number of posts
    return sortedPosts.slice(0, limit);
  } catch (error) {
    console.error(`Error getting posts for ${lang}:`, error);
    return [];
  }
}

// Add generateStaticParams function for static export
export async function generateStaticParams() {
  // Get all available languages by reading directories
  const contentPath = path.join(process.cwd(), "src", "content");

  try {
    // Get all language directories
    const languages = await fs.readdir(contentPath);

    // Create params for each language
    return languages
      .filter(async (lang) => {
        // Check if it's a directory
        const langPath = path.join(contentPath, lang);
        const langStat = await fs.stat(langPath);
        return langStat.isDirectory();
      })
      .map((lang) => ({
        lang,
      }));
  } catch (error) {
    console.error("Error generating static params for home page:", error);
    // Provide a fallback if there's an error
    return [{ lang: "en" }];
  }
}

export default async function Home(props: HomeProps) {
  const { lang } = await props.params;

  // Get latest posts for this language
  const latestPosts = await getLatestPosts(lang);

  return (
    <MainLayout lang={lang}>
      <HomePage lang={lang} />

      {/* Latest Articles Section */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8">Latest Articles</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {latestPosts.map((post) => (
            <div
              key={post.slug}
              className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <p className="text-sm text-gray-500 mb-2">
                  {new Date(post.date).toLocaleDateString()} •{" "}
                  {post.readingTime}
                </p>
                <h3 className="text-xl font-semibold mb-2">
                  <Link
                    href={`/${lang}/blog/${post.slug}`}
                    className="hover:underline"
                  >
                    {post.title}
                  </Link>
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {post.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            href={`/${lang}/blog`}
            className="inline-block px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span className="text-white">View All Articles</span>
          </Link>
        </div>
      </section>
    </MainLayout>
  );
}
