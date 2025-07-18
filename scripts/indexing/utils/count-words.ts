export function countWords(filteredWords: string[]) {
  // Count word frequencies
  const wordFrequencies = new Map<string, number>();
  filteredWords.forEach((word) => {
    wordFrequencies.set(word, (wordFrequencies.get(word) || 0) + 1);
  });

  const sortedFrequencies = Array.from(wordFrequencies.entries()).sort(
    (a, b) => b[1] - a[1]
  );

  return sortedFrequencies;
}
