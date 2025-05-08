interface TagDefinition {
  [key: string]: {
    en: string;
    es: string;
    pt: string;
  };
}

export const tags: TagDefinition = {
  cryptography: {
    en: "Cryptography",
    es: "Criptografía",
    pt: "Criptografia",
  },
  groups: {
    en: "Groups",
    es: "Grupos",
    pt: "Grupos",
  },
  modularArithmetic: {
    en: "Modular Arithmetic",
    es: "Aritmética Modular",
    pt: "Aritmética Modular",
  },
} as const;

// Create a union type of all tag keys
export type TagKey = keyof typeof tags;

// Helper function to get tag display name
export function getTagDisplayName(tag: TagKey, lang: string): string {
  return tags[tag][lang as keyof (typeof tags)[TagKey]] || (tag as string);
}

// Helper function to get all tags for a specific language
export function getAllTags(
  lang: string
): Array<{ key: TagKey; displayName: string }> {
  return Object.entries(tags).map(([key, translations]) => ({
    key: key as TagKey,
    displayName: translations[lang as keyof typeof translations] || key,
  }));
}
