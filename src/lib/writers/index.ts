import { Writer } from "./types";
import { loadWriters } from "./data";

export * from "./types";

export const writers: Record<string, Writer> = loadWriters();

export function getWriter(slug: string): Writer {
  if (writers[slug]) return writers[slug];
  throw new Error(`Writer with slug "${slug}" not found`);
}
