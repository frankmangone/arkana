import { ReadingList } from "./types";
import {
  getReadingListFactory,
  getAllReadingListsFactory,
  getReadingListsForPostFactory,
} from "./common";

export const readingLists: ReadingList[] = [
  {
    id: "cryptography-101",
    title: "Criptografia 101",
    description: "Uma introdução acessível aos conceitos de criptografia",
    ongoing: true,
    coverImage:
      "/images/cryptography-101/zero-knowledge-proofs-part-1/wingardium-leviosa.webp",
    items: [
      {
        id: "where-to-start",
        slug: "cryptography-101/where-to-start",
        order: 1,
      },
      {
        id: "asides-rsa-explained",
        slug: "cryptography-101/asides-rsa-explained",
        order: 2,
      },
      {
        id: "elliptic-curves-somewhat-demystified",
        slug: "cryptography-101/elliptic-curves-somewhat-demystified",
        order: 3,
      },
      {
        id: "encryption-and-digital-signatures",
        slug: "cryptography-101/encryption-and-digital-signatures",
        order: 4,
      },
      {
        id: "hashing",
        slug: "cryptography-101/hashing",
        order: 5,
      },
      {
        id: "protocols-galore",
        slug: "cryptography-101/protocols-galore",
        order: 6,
      },
      {
        id: "signatures-recharged",
        slug: "cryptography-101/signatures-recharged",
        order: 7,
      },
      {
        id: "homomorphisms-and-isomorphisms",
        slug: "cryptography-101/homomorphisms-and-isomorphisms",
        order: 8,
      },
      {
        id: "polynomials",
        slug: "cryptography-101/polynomials",
        order: 9,
      },
    ],
  },
];

export const getReadingList = getReadingListFactory(readingLists);
export const getAllReadingLists = getAllReadingListsFactory(readingLists);
export const getReadingListsForPost =
  getReadingListsForPostFactory(readingLists);
