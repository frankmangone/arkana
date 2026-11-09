import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { languages, type Locale } from "@/lib/i18n-config";
import { hiddenPostKey } from "./hidden-links";

export interface PostPath {
  folder: string;
  slug: string;
  languages: Locale[];
}

async function isVisiblePost(filePath: string): Promise<boolean> {
  try {
    const fileContent = await fs.readFile(filePath, "utf8");
    const { data } = matter(fileContent);
    return data.visible !== false;
  } catch {
    return false;
  }
}

// Scans src/data/content/<lang>/<folder>/<slug>.md and reports, per unique
// folder/slug, which languages have a translation. Hidden (visible: false)
// posts are excluded by default since callers use this for public listings
// (sitemap, language switcher); static-params.ts opts into includeHidden so
// hidden posts still get a statically built page.
export async function getPostPaths(
  includeHidden = false
): Promise<PostPath[]> {
  const contentPath = path.join(process.cwd(), "src", "data", "content");
  const found = new Map<string, Set<Locale>>();

  for (const lang of languages) {
    const langPath = path.join(contentPath, lang);
    let folders: string[];
    try {
      folders = await fs.readdir(langPath);
    } catch {
      continue;
    }

    for (const folder of folders) {
      const folderPath = path.join(langPath, folder);
      const stat = await fs.stat(folderPath);
      if (!stat.isDirectory()) continue;

      const files = await fs.readdir(folderPath);
      for (const file of files) {
        if (!file.endsWith(".md")) continue;
        if (
          !includeHidden &&
          !(await isVisiblePost(path.join(folderPath, file)))
        )
          continue;

        const key = `${folder}/${file.replace(/\.md$/, "")}`;
        const langs = found.get(key) ?? new Set<Locale>();
        langs.add(lang);
        found.set(key, langs);
      }
    }
  }

  return Array.from(found.entries()).map(([key, langs]) => {
    const [folder, slug] = key.split("/");
    return {
      folder,
      slug,
      languages: languages.filter((lang) => langs.has(lang)),
    };
  });
}

// Keys (see hiddenPostKey) of every visible: false post, per language. Used
// to keep links from visible posts from exposing draft URLs.
export async function getHiddenPostKeys(): Promise<Set<string>> {
  const contentPath = path.join(process.cwd(), "src", "data", "content");
  const hidden = new Set<string>();

  for (const lang of languages) {
    const langPath = path.join(contentPath, lang);
    let folders: string[];
    try {
      folders = await fs.readdir(langPath);
    } catch {
      continue;
    }

    for (const folder of folders) {
      const folderPath = path.join(langPath, folder);
      const stat = await fs.stat(folderPath);
      if (!stat.isDirectory()) continue;

      for (const file of await fs.readdir(folderPath)) {
        if (!file.endsWith(".md")) continue;
        if (await isVisiblePost(path.join(folderPath, file))) continue;
        hidden.add(hiddenPostKey(lang, folder, file.replace(/\.md$/, "")));
      }
    }
  }

  return hidden;
}

export async function getAvailablePostLanguages(
  folder: string,
  slug: string
): Promise<Locale[]> {
  const posts = await getPostPaths(true);
  const match = posts.find(
    (post) => post.folder === folder && post.slug === slug
  );
  return match?.languages ?? [];
}
