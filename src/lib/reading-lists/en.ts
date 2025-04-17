import { ReadingList } from "./types";
import {
  getReadingListFactory,
  getAllReadingListsFactory,
  getReadingListsForPostFactory,
} from "./common";

export const readingLists: ReadingList[] = [
  {
    id: "cryptography-101",
    title: "Cryptography 101",
    description: "A beginner-friendly introduction to cryptography concepts",
    // coverImage: "/images/reading-lists/cryptography-basics.jpg",
    items: [
      {
        slug: "cryptography-101/where-to-start",
        order: 1,
      },
      {
        slug: "cryptography-101/asides-rsa-explained",
        order: 2,
      },
      {
        slug: "cryptography-101/elliptic-curves-somewhat-demystified",
        order: 3,
      },
      {
        slug: "cryptography-101/encryption-and-digital-signatures",
        order: 4,
      },
      {
        slug: "cryptography-101/hashing",
        order: 5,
      },
      {
        slug: "cryptography-101/protocols-galore",
        order: 6,
      },
    ],
  },
];

export const getReadingList = getReadingListFactory(readingLists);
export const getAllReadingLists = getAllReadingListsFactory(readingLists);
export const getReadingListsForPost =
  getReadingListsForPostFactory(readingLists);
