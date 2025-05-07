import { Writer } from "./types";

export * from "./types";

export const writers: Record<string, Writer> = {
  "frank-mangone": {
    slug: "frank-mangone",
    name: "Frank Mangone",
    imageUrl: "/images/writers/frank-mangone/full-size.jpg",
    avatarUrl: "/images/writers/frank-mangone/avatar.png",
    bio: {
      en: "Creator of Purpura. Passionate about mathematics, cryptography, and computer science.",
      es: "Creador de Purpura. Apasionado por las matemáticas, la criptografía y la informática.",
      pt: "Criador de Purpura. Apaixonado por matemática, criptografia e ciência da computação.",
    },
    social: {
      twitter: "https://x.com/0xfrankmangone",
      github: "https://github.com/frankmangone",
      medium: "https://medium.com/@francomangone18",
    },
  },
};

export function getWriter(slug: string): Writer {
  if (writers[slug]) return writers[slug];
  throw new Error(`Writer with slug "${slug}" not found`);
}
