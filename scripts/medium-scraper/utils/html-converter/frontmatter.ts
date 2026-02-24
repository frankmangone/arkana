interface FrontmatterOptions {
  title: string;
  formattedDate: string;
  readingTime: string;
  mediumUrl?: string;
}

export function createFrontmatter(options: FrontmatterOptions): string {
  const { title, formattedDate, readingTime, mediumUrl } = options;

  return [
    "---",
    `title: '${title.replace(/'/g, "''")}'`,
    formattedDate ? `date: '${formattedDate}'` : "",
    "author: frank-mangone",
    "thumbnail: # TODO: Add thumbnail path",
    "tags:",
    "  # TODO: Add tags",
    "description: >-",
    "  # TODO: Add description",
    readingTime ? `readingTime: ${readingTime.replace("min read", "min")}` : "",
    mediumUrl ? `mediumUrl: ${mediumUrl}` : "",
    "contentHash: # TODO: Add content hash",
    "---",
    "",
  ]
    .filter((line) => line !== "")
    .join("\n");
}
