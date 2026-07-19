"use client";

import { useMemo } from "react";

interface DecryptedTextProps {
  text: string;
  className?: string;
}

export function DecryptedText({ text, className = "" }: DecryptedTextProps) {
  const characters = useMemo(() => Array.from(text), [text]);

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {characters.map((char, index) =>
          /\s/.test(char) ? (
            <span key={index}>{char}</span>
          ) : (
            <span key={index} className="relative inline-block">
              <span>{char}</span>
            </span>
          )
        )}
      </span>
    </span>
  );
}
