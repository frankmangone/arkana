"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import ArkanaPattern from "@/components/arkana-pattern";
import type { Pattern } from "@/components/arkana-strip";

type Elements = Pattern["elements"];

const GLYPH_LINE_COLOR = "#ffffff";
const GLYPH_LINE_WIDTH = 3.5;
const TICK_MS = 65;
const REVEAL_STAGGER_MS = 45;
const START_DELAY_MS = 150;

function bitsToElements(bits: string): Elements {
  return {
    left: true,
    right: true,

    top: bits[0] === "1",
    bottom: bits[1] === "1",

    top_left_ray: bits[2] === "1",
    top_right_ray: bits[3] === "1",
    bottom_left_ray: bits[4] === "1",
    bottom_right_ray: bits[5] === "1",

    top_left_left_side: bits[6] === "1",
    top_top_left_side: bits[7] === "1",
    top_top_right_side: bits[8] === "1",
    top_right_right_side: bits[9] === "1",
    bottom_right_right_side: bits[10] === "1",
    bottom_bottom_right_side: bits[11] === "1",
    bottom_bottom_left_side: bits[12] === "1",
    bottom_left_left_side: bits[13] === "1",

    central_diagonal_1: bits[14] === "1",
    central_diagonal_2: bits[15] === "1",
  };
}

function randomElements(): Elements {
  let bits = "";
  for (let i = 0; i < 16; i++) {
    bits += Math.random() > 0.5 ? "1" : "0";
  }
  return bitsToElements(bits);
}

interface DecryptedTextProps {
  text: string;
  className?: string;
}

interface CharGroup {
  isWhitespace: boolean;
  indices: number[];
}

// Groups characters into runs of whitespace and non-whitespace so each word
// can be wrapped as a single unbreakable unit — otherwise each character's
// own inline-block span is an independent break opportunity and the browser
// can wrap a line in the middle of a word.
function groupCharacters(characters: string[]): CharGroup[] {
  const groups: CharGroup[] = [];
  characters.forEach((char, index) => {
    const isWhitespace = /\s/.test(char);
    const last = groups[groups.length - 1];
    if (last && last.isWhitespace === isWhitespace) {
      last.indices.push(index);
    } else {
      groups.push({ isWhitespace, indices: [index] });
    }
  });
  return groups;
}

export function DecryptedText({ text, className = "" }: DecryptedTextProps) {
  const characters = useMemo(() => Array.from(text), [text]);
  const groups = useMemo(() => groupCharacters(characters), [characters]);
  const containerRef = useRef<HTMLSpanElement>(null);
  const glyphsRef = useRef<HTMLSpanElement>(null);
  const measureCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [glyphSize, setGlyphSize] = useState(24);
  const [revealed, setRevealed] = useState<boolean[]>(() =>
    characters.map(() => true)
  );

  // Sizing: the glyph size stays constant everywhere (a fixed square), and a
  // hidden canvas measures real text width (using the hero's own computed
  // font) so unrevealed runs can be replaced by an estimated *count* of
  // fixed-size glyphs spanning roughly the same width as the text they
  // stand in for — never a per-character, variously-sized glyph. This also
  // runs as a layout effect (before paint) so measurements are ready before
  // the first scrambled frame ever paints.
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      const computed = getComputedStyle(container);
      const fontSize = parseFloat(computed.fontSize);
      setGlyphSize(Math.round(fontSize * 0.8));

      if (!measureCtxRef.current) {
        measureCtxRef.current =
          document.createElement("canvas").getContext("2d");
      }
      if (measureCtxRef.current) {
        measureCtxRef.current.font = computed.font;
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Scramble on mount, then reveal characters left-to-right over time.
  // Skipped entirely under prefers-reduced-motion (stays fully revealed).
  // useLayoutEffect (not useEffect) so the scramble commits before the
  // browser paints — avoids a flash of plain text on first paint. The
  // animated span also starts CSS-hidden (opacity-0, see render) so there's
  // no flash even if hydration itself is slow — this effect is what turns
  // it visible again, right as it either scrambles or (reduced motion)
  // reveals, so the very first visible paint is always the correct one.
  useLayoutEffect(() => {
    if (glyphsRef.current) glyphsRef.current.style.opacity = "1";

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reducedMotion) return;

    setRevealed(characters.map(() => false));

    const startTime = performance.now();
    const totalDuration =
      START_DELAY_MS + characters.length * REVEAL_STAGGER_MS;

    const interval = window.setInterval(() => {
      const elapsed = performance.now() - startTime;

      setRevealed((prev) =>
        prev.map(
          (isRevealed, index) =>
            isRevealed ||
            elapsed >= START_DELAY_MS + index * REVEAL_STAGGER_MS
        )
      );

      if (elapsed >= totalDuration) {
        window.clearInterval(interval);
      }
    }, TICK_MS);

    return () => window.clearInterval(interval);
  }, [characters]);

  // Estimated glyph count spanning roughly the same width as `str` would
  // render at, using the hero's real font metrics. Falls back to one glyph
  // per character if the measuring context isn't ready yet.
  const estimateGlyphCount = (str: string): number => {
    const ctx = measureCtxRef.current;
    if (!ctx) return str.length;
    return Math.max(1, Math.round(ctx.measureText(str).width / glyphSize));
  };

  return (
    <span ref={containerRef} className={className}>
      <span className="sr-only">{text}</span>
      {/*
        Hidden by default (pure CSS, present from the very first paint —
        no JS needed) so a JS-enabled client never flashes plain text before
        the mount effect above scrambles it. The noscript override restores
        visibility for clients that never run JS at all, so the plain text
        is still visible to them (just without the animation).
      */}
      <span
        ref={glyphsRef}
        aria-hidden="true"
        className="decrypted-text-glyphs opacity-0"
      >
        {groups.map((group, groupIndex) => {
          if (group.isWhitespace) {
            return (
              <span key={groupIndex}>
                {group.indices.map((index) => characters[index]).join("")}
              </span>
            );
          }

          const splitAt = group.indices.findIndex((index) => !revealed[index]);
          const revealedIndices =
            splitAt === -1 ? group.indices : group.indices.slice(0, splitAt);
          const unrevealedIndices =
            splitAt === -1 ? [] : group.indices.slice(splitAt);
          const revealedText = revealedIndices
            .map((index) => characters[index])
            .join("");
          const unrevealedText = unrevealedIndices
            .map((index) => characters[index])
            .join("");
          const glyphCount = unrevealedText
            ? estimateGlyphCount(unrevealedText)
            : 0;

          return (
            <span key={groupIndex} className="inline-block whitespace-nowrap">
              {revealedText && <span>{revealedText}</span>}
              {glyphCount > 0 && (
                <span className="inline-flex align-middle">
                  {Array.from({ length: glyphCount }, (_, i) => (
                    <ArkanaPattern
                      key={i}
                      elements={randomElements()}
                      canvasSize={glyphSize}
                      lineWidth={GLYPH_LINE_WIDTH}
                      lineColor={GLYPH_LINE_COLOR}
                      backgroundColor="transparent"
                    />
                  ))}
                </span>
              )}
            </span>
          );
        })}
      </span>
      <noscript>
        <style>{".decrypted-text-glyphs { opacity: 1 !important; }"}</style>
      </noscript>
    </span>
  );
}
