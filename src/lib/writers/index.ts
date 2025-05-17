import { Writer } from "./types";

export * from "./types";

export const writers: Record<string, Writer> = {
  "frank-mangone": {
    slug: "frank-mangone",
    name: "Frank Mangone",
    imageUrl: "/images/writers/frank-mangone/full-size.png",
    avatarUrl: "/images/writers/frank-mangone/avatar.png",
    organization: {
      name: "SpaceDev",
      url: "https://spacedev.io",
      logoUrl: "/images/logos/spacedev.logo.webp",
    },
    bio: {
      en: "Creator of Arkana. Passionate about mathematics, cryptography, and computer science.",
      es: "Creador de Arkana. Apasionado por las matemáticas, la criptografía y la informática.",
      pt: "Criador de Arkana. Apaixonado por matemática, criptografia e ciência da computação.",
    },
    social: {
      twitter: "https://x.com/0xfrankmangone",
      linkedin: "https://www.linkedin.com/in/frank-mangone/",
      github: "https://github.com/frankmangone",
      medium: "https://medium.com/@francomangone18",
    },
  },
  "gonzalo-bustos": {
    slug: "gonzalo-bustos",
    name: "Gonzalo Bustos",
    imageUrl: "/images/writers/gonzalo-bustos/full-size.jpeg",
    avatarUrl: "/images/writers/gonzalo-bustos/avatar.png",
    organization: {
      name: "SpaceDev",
      url: "https://spacedev.io",
      logoUrl: "/images/logos/spacedev.logo.webp",
    },
    bio: {
      en: "Computer Science student, passionate about technology and innovation.",
      es: "Estudiante de Ciencias de la Computación, apasionado por la tecnología y la innovación.",
      pt: "Estudante de Ciência da Computação, apaixonado por tecnologia e inovação.",
    },
    social: {
      twitter: "https://x.com/gonzalombustos",
      linkedin: "https://www.linkedin.com/in/gonzalo-bustos/",
      github: "https://github.com/GonzaloMBustos",
      medium: "https://medium.com/@bustosgonzalom",
    },
  },
};

export function getWriter(slug: string): Writer {
  if (writers[slug]) return writers[slug];
  throw new Error(`Writer with slug "${slug}" not found`);
}
