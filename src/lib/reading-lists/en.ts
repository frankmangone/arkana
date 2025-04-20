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
      {
        slug: "cryptography-101/signatures-recharged",
        order: 7,
      },
      {
        slug: "cryptography-101/asides-evaluating-security",
        order: 8,
      },
      {
        slug: "cryptography-101/homomorphisms-and-isomorphisms",
        order: 9,
      },
      {
        slug: "cryptography-101/polynomials",
        order: 10,
      },
      {
        slug: "cryptography-101/threshold-signatures",
        order: 11,
      },
      {
        slug: "cryptography-101/pairings",
        order: 11,
      },
      {
        slug: "cryptography-101/pairing-applications-and-more",
        order: 12,
      },
      {
        slug: "cryptography-101/commitment-schemes-revisited",
        order: 13,
      },
      {
        slug: "cryptography-101/zero-knowledge-proofs-part-1",
        order: 14,
      },
      {
        slug: "cryptography-101/arithmetic-circuits",
        order: 15,
      },
      {
        slug: "cryptography-101/zero-knowledge-proofs-part-2",
        order: 16,
      },
    ],
  },
];

export const getReadingList = getReadingListFactory(readingLists);
export const getAllReadingLists = getAllReadingListsFactory(readingLists);
export const getReadingListsForPost =
  getReadingListsForPostFactory(readingLists);
