import { ReadingList } from "./types";
import {
  getReadingListFactory,
  getAllReadingListsFactory,
  getReadingListsForPostFactory,
} from "./common";

export const readingLists: ReadingList[] = [
  {
    id: "cryptography-101",
    title: "Criptografía 101",
    description:
      "Una introducción accesible a los conceptos más importantes de la criptografía",
    coverImage:
      "/images/cryptography-101/zero-knowledge-proofs-part-1/wingardium-leviosa.webp",
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
        order: 12,
      },
      {
        slug: "cryptography-101/pairing-applications-and-more",
        order: 13,
      },
      {
        slug: "cryptography-101/commitment-schemes-revisited",
        order: 14,
      },
      {
        slug: "cryptography-101/zero-knowledge-proofs-part-1",
        order: 15,
      },
      {
        slug: "cryptography-101/arithmetic-circuits",
        order: 16,
      },
      {
        slug: "cryptography-101/zero-knowledge-proofs-part-2",
        order: 17,
      },
      {
        slug: "cryptography-101/zero-knowledge-proofs-part-3",
        order: 18,
      },
      {
        slug: "cryptography-101/starks",
        order: 19,
      },
      {
        slug: "cryptography-101/rings",
        order: 20,
      },
      {
        slug: "cryptography-101/ring-learning-with-errors",
        order: 21,
      },
      {
        slug: "cryptography-101/post-quantum-cryptography",
        order: 22,
      },
      {
        slug: "cryptography-101/fully-homomorphic-encryption",
        order: 23,
      },
    ],
  },
  {
    id: "blockchain-101",
    title: "Blockchain 101",
    description:
      "Una introducción amigable para principiantes a los conceptos de blockchain",
    coverImage: "/images/blockchain-101/transactions/doge.webp",
    ongoing: true,
    items: [
      {
        slug: "blockchain-101/how-it-all-began",
        order: 1,
      },
      {
        slug: "blockchain-101/transactions",
        order: 2,
      },
      {
        slug: "blockchain-101/a-primer-on-consensus",
        order: 3,
      },
      {
        slug: "blockchain-101/wrapping-up-bitcoin",
        order: 4,
      },
      {
        slug: "blockchain-101/enter-ethereum",
        order: 5,
      },
      {
        slug: "blockchain-101/storage",
        order: 6,
      },
      {
        slug: "blockchain-101/smart-contracts",
        order: 7,
      },
      {
        slug: "blockchain-101/smart-contracts-part-2",
        order: 8,
      },
      {
        slug: "blockchain-101/consensus-revisited",
        order: 9,
      },
      {
        slug: "blockchain-101/wrapping-up-ethereum",
        order: 10,
      },
      {
        slug: "blockchain-101/rollups",
        order: 11,
      },
      {
        slug: "blockchain-101/solana",
        order: 12,
      },
      {
        slug: "blockchain-101/solana-programs",
        order: 13,
      },
      {
        slug: "blockchain-101/blockchain-safari",
        order: 14,
      },
    ],
  },
  {
    id: "elliptic-curves-in-depth",
    title: "Curvas Elípticas En Profundidad",
    description: "Una inmersión más profunda en las curvas elípticas",
    coverImage: "/images/elliptic-curves-in-depth/part-4/yoda.webp",
    ongoing: true,
    items: [
      {
        slug: "elliptic-curves-in-depth/part-1",
        order: 1,
      },
      {
        slug: "elliptic-curves-in-depth/part-2",
        order: 2,
      },
      {
        slug: "elliptic-curves-in-depth/part-3",
        order: 3,
      },
      {
        slug: "elliptic-curves-in-depth/part-4",
        order: 4,
      },
      {
        slug: "elliptic-curves-in-depth/part-5",
        order: 5,
      },
      {
        slug: "elliptic-curves-in-depth/part-6",
        order: 6,
      },
      {
        slug: "elliptic-curves-in-depth/part-7",
        order: 7,
      },
    ],
  },
];

export const getReadingList = getReadingListFactory(readingLists);
export const getAllReadingLists = getAllReadingListsFactory(readingLists);
export const getReadingListsForPost =
  getReadingListsForPostFactory(readingLists);
