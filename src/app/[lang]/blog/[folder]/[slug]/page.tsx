import { getPostBySlug } from "@/features/posts/actions";
import { PostPage } from "@/features/posts";
import { Metadata } from "next";
import fs from "fs/promises";
import path from "path";
import { MainLayout } from "@/components/layouts/main-layout";

interface PageParams {
  lang: string;
  folder: string;
  slug: string;
}

interface PageProps {
  params: Promise<PageParams>;
}

// This function is required for static export
export async function generateStaticParams() {
  const contentPath = path.join(process.cwd(), "src", "content");
  const params: Partial<PageParams>[] = [];

  try {
    // Get all language directories
    const languages = await fs.readdir(contentPath);

    for (const lang of languages) {
      const langPath = path.join(contentPath, lang);
      const langStat = await fs.stat(langPath);

      // Skip if not a directory
      if (!langStat.isDirectory()) continue;

      // Function to process files in a directory
      const processDirectory = async (dirPath: string, folder = "") => {
        const files = await fs.readdir(dirPath);

        for (const file of files) {
          const filePath = path.join(dirPath, file);
          const stat = await fs.stat(filePath);

          if (stat.isDirectory()) {
            // If it's a directory, process its files with the directory name as the folder
            await processDirectory(filePath, file);
          } else if (file.endsWith(".md")) {
            // If it's a markdown file
            const slug = file.replace(".md", "");

            if (folder) {
              // If it's in a folder, use the folder/slug format
              params.push({
                lang,
                folder,
                slug,
              });
            } else {
              // If it's at the root level, just use the slug
              params.push({
                lang,
                folder,
                slug,
              });
            }
          }
        }
      };

      // Start processing from the language directory
      await processDirectory(langPath);
    }
  } catch (error) {
    console.error(`Error processing directories:`, error);
  }

  return params;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { folder, slug, lang } = await params;
  const fullSlug = `${folder}/${slug}`;
  const post = await getPostBySlug(fullSlug, lang);

  if (!post) {
    return {
      title: "Post Not Found",
      description: "The requested post could not be found.",
    };
  }

  return {
    title: post.metadata.title,
    description: post.metadata.description,
    authors: [{ name: post.metadata.author }],
    keywords: post.metadata.tags,
  };
}

export default async function Page({ params }: PageProps) {
  const { lang, folder, slug } = await params;

  const fullSlug = `${folder}/${slug}`;

  return (
    <MainLayout lang={lang}>
      <PostPage lang={lang} slug={fullSlug} />
    </MainLayout>
  );
}
