import { DecryptedText } from "@/components/decrypted-text";

// Flattens children to a plain string only if they contain no rich markup
// (LaTeX, bold, etc.) — those need their own elements rendered as-is, so
// only plain-text big quotes get the decrypt effect.
function flattenIfPlainText(node: React.ReactNode): string | null {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) {
    const parts = node.map(flattenIfPlainText);
    return parts.some((part) => part === null) ? null : parts.join("");
  }
  return null;
}

export function BigQuote({ children }: { children: React.ReactNode }) {
  const plainText = flattenIfPlainText(children);

  return (
    <span className="my-12 block w-full py-10">
      <span className="mx-auto block w-full max-w-full px-2 text-center text-2xl font-medium leading-snug tracking-tight text-ink-heading md:text-[1.75rem] md:leading-snug break-words [overflow-wrap:anywhere] [&_*]:break-words [&_*]:[overflow-wrap:anywhere]">
        {plainText !== null ? (
          <DecryptedText
            text={plainText}
            triggerOn="visible"
            lineWidth={1.5}
            tickMs={28}
            revealStaggerMs={15}
            startDelayMs={60}
          />
        ) : (
          children
        )}
      </span>
    </span>
  );
}
