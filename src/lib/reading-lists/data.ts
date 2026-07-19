import fs from "fs";
import path from "path";
import { ReadingList, ReadingListItem, ReadingListModule } from "./types";

interface RawTranslation {
  title: string;
  description: string;
}

interface RawItem {
  id: string;
  slug: string;
  order?: number;
}

interface RawModule {
  id: string;
  translations: Record<string, RawTranslation>;
  items: RawItem[];
}

interface RawReadingList {
  id: string;
  coverImage?: string;
  ongoing?: boolean;
  translations: Record<string, RawTranslation>;
  modules: RawModule[];
}

const DATA_DIR = path.join(process.cwd(), "src", "data", "reading-lists");

// Deliberately uncached: these JSON files are hand-edited during local dev, and
// Next's file watcher doesn't know to invalidate a plain fs.readFileSync() call
// the way it does for source files. Re-reading a handful of small JSON files
// is negligible next to everything else a page render already does.
function loadRawReadingLists(): RawReadingList[] {
  const files = fs
    .readdirSync(DATA_DIR)
    .filter((file) => file.endsWith(".json"));

  return files.map((file) => {
    const raw = fs.readFileSync(path.join(DATA_DIR, file), "utf8");
    return JSON.parse(raw) as RawReadingList;
  });
}

function resolveModule(
  raw: RawModule,
  lang: string
): ReadingListModule | null {
  const translation = raw.translations[lang];
  if (!translation) {
    return null;
  }

  const items: ReadingListItem[] = raw.items
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((item) => ({ id: item.id, slug: item.slug, order: item.order }));

  return {
    id: raw.id,
    title: translation.title,
    description: translation.description,
    items,
  };
}

function resolveReadingList(
  raw: RawReadingList,
  lang: string
): ReadingList | null {
  const translation = raw.translations[lang];
  if (!translation) {
    return null;
  }

  const modules = raw.modules
    .map((rawModule) => resolveModule(rawModule, lang))
    .filter((module): module is ReadingListModule => module !== null);

  if (modules.length === 0) {
    return null;
  }

  return {
    id: raw.id,
    title: translation.title,
    description: translation.description,
    coverImage: raw.coverImage,
    ongoing: raw.ongoing,
    modules,
    items: modules.flatMap((module) => module.items),
  };
}

export function getAllReadingListsForLang(lang: string): ReadingList[] {
  return loadRawReadingLists()
    .map((raw) => resolveReadingList(raw, lang))
    .filter((list): list is ReadingList => list !== null);
}
