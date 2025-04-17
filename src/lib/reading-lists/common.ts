import { ReadingList } from "./types";

/**
 * Thunk to generate a get a reading list by ID function
 * @param {string} id - The ID of the reading list
 * @returns {ReadingList | undefined} The reading list or undefined if it doesn't exist
 */
export const getReadingListFactory =
  (readingLists: ReadingList[]) =>
  (id: string): ReadingList | undefined => {
    return readingLists.find((list) => list.id === id);
  };

/**
 * Thunk to generate a function to get all reading lists
 * @param {ReadingList[]} readingLists - The reading lists
 * @returns {ReadingList[]} All reading lists
 */
export const getAllReadingListsFactory =
  (readingLists: ReadingList[]) => (): ReadingList[] => {
    return readingLists;
  };

/**
 * Thunk to generate a function to get all reading lists that a post belongs to
 * @param {ReadingList[]} readingLists - The reading lists
 * @returns {ReadingList[]} All reading lists that the post belongs to
 */
export const getReadingListsForPostFactory =
  (readingLists: ReadingList[]) =>
  (slug: string): ReadingList[] => {
    return readingLists.filter((list) =>
      list.items.some((item) => item.slug === slug)
    );
  };
