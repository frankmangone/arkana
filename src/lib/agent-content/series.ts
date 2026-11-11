// Display names for the series folders under content/{lang}/. A folder that
// isn't listed falls back to its slug, title-cased.
const SERIES_NAMES: Record<string, string> = {
  "blockchain-101": "Blockchain 101",
  "cryptography-101": "Cryptography 101",
  "elliptic-curves-in-depth": "Elliptic Curves in Depth",
  ethereum: "Ethereum",
  "the-zk-chronicles": "The ZK Chronicles",
  "understanding-ai": "Understanding AI",
  "wtf-is": "WTF is…",
};

export function seriesName(folder: string): string {
  return (
    SERIES_NAMES[folder] ??
    folder
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
}
