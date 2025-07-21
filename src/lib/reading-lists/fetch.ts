import {
  ReadingList,
  ReadingListItem,
  readingLists,
} from "@/lib/reading-lists";

export function getAllReadingLists(lang: string): ReadingList[] {
  return readingLists[lang];
}

interface GetReadingListParams {
  lang: string;
  id: string;
}

export function getReadingList(
  params: GetReadingListParams
): ReadingList | null {
  const { lang, id } = params;

  const readingList = readingLists[lang].find((list) => list.id === id);

  if (!readingList) return null;

  return readingList;
}

interface GetPostFromReadingListParams {
  lang: string;
  id: string;
  postId: string;
}

export function getPostFromReadingList(
  params: GetPostFromReadingListParams
): ReadingListItem | null {
  const { lang, id, postId } = params;

  const readingList = getReadingList({ lang, id });

  if (!readingList) return null;

  const post = readingList.items.find((item) => item.id === postId);

  if (!post) return null;

  return post;
}
