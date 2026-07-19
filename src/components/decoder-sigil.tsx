"use client";

import { createHash } from "crypto";
import { useEffect, useMemo, useRef, useState } from "react";
import ArkanaPattern from "@/components/arkana-pattern";
import type { Pattern } from "@/components/arkana-strip";

type Elements = Pattern["elements"];

const DEFAULT_GLYPH_COUNT = 16; // 4×4 grid — 16 glyphs × 16 bits = the full SHA-256
const TICK_MS = 90;
const LOCK_EVERY_TICKS = 2; // one glyph locks onto the fingerprint every 2 ticks
const IDLE_GAP_TICKS = 26; // pause between idle flickers (~2.3s)
const IDLE_SCRAMBLE_TICKS = 3;

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

/** The glyph fingerprint of the message, same encoding as ArkanaStrip. */
function fingerprintElements(content: string, glyphCount: number): Elements[] {
  const hash = createHash("sha256").update(content).digest("hex");
  const binary = BigInt("0x" + hash)
    .toString(2)
    .padStart(256, "0");
  return Array.from({ length: glyphCount }, (_, i) =>
    bitsToElements(binary.slice(i * 16, i * 16 + 16))
  );
}

/** rank[i] = position at which glyph i locks during the decode. */
function shuffledRanks(glyphCount: number): number[] {
  const order = Array.from({ length: glyphCount }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const rank = new Array<number>(glyphCount);
  order.forEach((glyph, position) => {
    rank[glyph] = position;
  });
  return rank;
}

/** rank[i] = i — glyphs lock in order, left to right / first to last. */
function sequentialRanks(glyphCount: number): number[] {
  return Array.from({ length: glyphCount }, (_, i) => i);
}

interface AnimState {
  mode: "waiting" | "decode" | "idle";
  rank: number[];
  locked: number;
  tick: number;
  cooldown: number;
  idleIdx: number;
  idleLeft: number;
}

interface DecoderSigilProps {
  /** Message whose SHA-256 fingerprint the grid decodes into. */
  content: string;
  className?: string;
  lineColor?: string;
  /** "grid" (default) is a 4×4 square; "row" is a single horizontal strip. */
  layout?: "grid" | "row";
  /** Number of glyphs. Defaults to 16 (a full 4×4 grid). */
  glyphCount?: number;
  /** When true, glyphs lock left-to-right in order instead of a shuffled
   * order — reads as the fingerprint "building itself" one glyph at a time. */
  sequential?: boolean;
  /** When false, skip the occasional single-glyph re-scramble after the
   * initial decode completes — stays fully locked. Defaults to true. */
  idleFlicker?: boolean;
}

/**
 * A grid (or row) of Arkana glyphs that "decodes" into the fingerprint of
 * its message when scrolled into view, then idles with occasional one-glyph
 * flickers. Static (already decoded) under prefers-reduced-motion.
 */
export function DecoderSigil({
  content,
  className,
  lineColor = "#a777ff",
  layout = "grid",
  glyphCount = DEFAULT_GLYPH_COUNT,
  sequential = false,
  idleFlicker = true,
}: DecoderSigilProps) {
  const target = useMemo(
    () => fingerprintElements(content, glyphCount),
    [content, glyphCount]
  );
  const [glyphs, setGlyphs] = useState<Elements[]>(target);
  const [canvasSize, setCanvasSize] = useState(64);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<AnimState>({
    mode: "waiting",
    rank: [],
    locked: 0,
    tick: 0,
    cooldown: IDLE_GAP_TICKS,
    idleIdx: -1,
    idleLeft: 0,
  });
  const reducedRef = useRef(false);

  useEffect(() => {
    const updateSize = () => {
      setCanvasSize(window.innerWidth >= 768 ? 64 : 52);
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    reducedRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reducedRef.current) return; // stays on the decoded fingerprint

    const anim = animRef.current;

    const step = () => {
      if (anim.mode === "decode") {
        anim.tick += 1;
        if (anim.tick % LOCK_EVERY_TICKS === 0) anim.locked += 1;
        setGlyphs(
          target.map((elements, i) =>
            anim.rank[i] < anim.locked ? elements : randomElements()
          )
        );
        if (anim.locked >= glyphCount) {
          anim.mode = "idle";
          anim.cooldown = IDLE_GAP_TICKS;
        }
        return;
      }

      if (anim.mode === "idle") {
        if (!idleFlicker) return;
        if (anim.cooldown > 0) {
          anim.cooldown -= 1;
          if (anim.cooldown === 0) {
            anim.idleIdx = Math.floor(Math.random() * glyphCount);
            anim.idleLeft = IDLE_SCRAMBLE_TICKS;
          }
          return;
        }
        if (anim.idleLeft > 0) {
          anim.idleLeft -= 1;
          if (anim.idleLeft === 0) {
            setGlyphs(target);
            anim.cooldown =
              IDLE_GAP_TICKS + Math.floor(Math.random() * IDLE_GAP_TICKS);
          } else {
            setGlyphs(
              target.map((elements, i) =>
                i === anim.idleIdx ? randomElements() : elements
              )
            );
          }
        }
      }
    };

    let interval: number | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (anim.mode === "waiting") {
            anim.mode = "decode";
            anim.rank = sequential
              ? sequentialRanks(glyphCount)
              : shuffledRanks(glyphCount);
            anim.locked = 0;
            anim.tick = 0;
          }
          if (interval === undefined) {
            interval = window.setInterval(step, TICK_MS);
          }
        } else if (interval !== undefined) {
          window.clearInterval(interval);
          interval = undefined;
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(container);

    return () => {
      observer.disconnect();
      if (interval !== undefined) window.clearInterval(interval);
    };
  }, [target, glyphCount, sequential, idleFlicker]);

  return (
    <div
      ref={containerRef}
      className={`${layout === "row" ? "flex" : "grid grid-cols-4"} ${className ?? ""}`}
      aria-hidden="true"
    >
      {glyphs.map((elements, i) => (
        <ArkanaPattern
          key={i}
          elements={elements}
          canvasSize={canvasSize}
          lineColor={lineColor}
          backgroundColor="transparent"
        />
      ))}
    </div>
  );
}
