// Tuned against the hand-written reading times of the cryptography-101 series:
// every article lands within a minute of its original value. Whitespace-separated
// tokens are counted as-is, so image tags and math carry their own implicit cost.
const WORDS_PER_MINUTE = 250;

export function estimateReadingTime(markdown: string): string {
  const words = markdown.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));

  return `${minutes} min`;
}
