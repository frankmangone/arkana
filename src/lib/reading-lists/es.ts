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
        id: "asides-evaluating-security",
        slug: "cryptography-101/asides-evaluating-security",
        order: 8,
      },
      {
        id: "homomorphisms-and-isomorphisms",
        slug: "cryptography-101/homomorphisms-and-isomorphisms",
        order: 9,
      },
      {
        id: "polynomials",
        slug: "cryptography-101/polynomials",
        order: 10,
      },
      {
        id: "threshold-signatures",
        slug: "cryptography-101/threshold-signatures",
        order: 11,
      },
      {
        id: "pairings",
        slug: "cryptography-101/pairings",
        order: 12,
      },
      {
        id: "pairing-applications-and-more",
        slug: "cryptography-101/pairing-applications-and-more",
        order: 13,
      },
      {
        id: "commitment-schemes-revisited",
        slug: "cryptography-101/commitment-schemes-revisited",
        order: 14,
      },
      {
        id: "zero-knowledge-proofs-part-1",
        slug: "cryptography-101/zero-knowledge-proofs-part-1",
        order: 15,
      },
      {
        id: "arithmetic-circuits",
        slug: "cryptography-101/arithmetic-circuits",
        order: 16,
      },
      {
        id: "zero-knowledge-proofs-part-2",
        slug: "cryptography-101/zero-knowledge-proofs-part-2",
        order: 17,
      },
      {
        id: "zero-knowledge-proofs-part-3",
        slug: "cryptography-101/zero-knowledge-proofs-part-3",
        order: 18,
      },
      {
        id: "starks",
        slug: "cryptography-101/starks",
        order: 19,
      },
      {
        id: "rings",
        slug: "cryptography-101/rings",
        order: 20,
      },
      {
        id: "ring-learning-with-errors",
        slug: "cryptography-101/ring-learning-with-errors",
        order: 21,
      },
      {
        id: "post-quantum-cryptography",
        slug: "cryptography-101/post-quantum-cryptography",
        order: 22,
      },
      {
        id: "fully-homomorphic-encryption",
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
        id: "how-it-all-began",
        slug: "blockchain-101/how-it-all-began",
        order: 1,
      },
      {
        id: "transactions",
        slug: "blockchain-101/transactions",
        order: 2,
      },
      {
        id: "a-primer-on-consensus",
        slug: "blockchain-101/a-primer-on-consensus",
        order: 3,
      },
      {
        id: "wrapping-up-bitcoin",
        slug: "blockchain-101/wrapping-up-bitcoin",
        order: 4,
      },
      {
        id: "ethereum",
        slug: "blockchain-101/ethereum",
        order: 5,
      },
      {
        id: "storage",
        slug: "blockchain-101/storage",
        order: 6,
      },
      {
        id: "smart-contracts",
        slug: "blockchain-101/smart-contracts",
        order: 7,
      },
      {
        id: "smart-contracts-part-2",
        slug: "blockchain-101/smart-contracts-part-2",
        order: 8,
      },
      {
        id: "consensus-revisited",
        slug: "blockchain-101/consensus-revisited",
        order: 9,
      },
      {
        id: "wrapping-up-ethereum",
        slug: "blockchain-101/wrapping-up-ethereum",
        order: 10,
      },
      {
        id: "rollups",
        slug: "blockchain-101/rollups",
        order: 11,
      },
      {
        id: "solana",
        slug: "blockchain-101/solana",
        order: 12,
      },
      {
        id: "solana-programs",
        slug: "blockchain-101/solana-programs",
        order: 13,
      },
      {
        id: "blockchain-safari",
        slug: "blockchain-101/blockchain-safari",
        order: 14,
      },
      {
        id: "parallelizing-execution",
        slug: "blockchain-101/parallelizing-execution",
        order: 15,
      },
      {
        id: "beyond-the-blockchain-part-1",
        slug: "blockchain-101/beyond-the-blockchain-part-1",
        order: 16,
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
        id: "part-1",
        slug: "elliptic-curves-in-depth/part-1",
        order: 1,
      },
      {
        id: "part-2",
        slug: "elliptic-curves-in-depth/part-2",
        order: 2,
      },
      {
        id: "part-3",
        slug: "elliptic-curves-in-depth/part-3",
        order: 3,
      },
      {
        id: "part-4",
        slug: "elliptic-curves-in-depth/part-4",
        order: 4,
      },
      {
        id: "part-5",
        slug: "elliptic-curves-in-depth/part-5",
        order: 5,
      },
      {
        id: "part-6",
        slug: "elliptic-curves-in-depth/part-6",
        order: 6,
      },
      {
        id: "part-7",
        slug: "elliptic-curves-in-depth/part-7",
        order: 7,
      },
      {
        id: "part-8",
        slug: "elliptic-curves-in-depth/part-8",
        order: 8,
      },
    ],
  },
];

export const getReadingList = getReadingListFactory(readingLists);
export const getAllReadingLists = getAllReadingListsFactory(readingLists);
export const getReadingListsForPost =
  getReadingListsForPostFactory(readingLists);
