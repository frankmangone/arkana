"use client";

import { createHash } from "crypto";
import { useEffect, useMemo, useRef, useState } from "react";
import ArkanaPattern from "@/components/arkana-pattern";
import type { Pattern } from "@/components/arkana-strip";

type Elements = Pattern["elements"];

const GLYPH_COUNT = 16; // 4×4 grid — 16 glyphs × 16 bits = the full SHA-256
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

/** The 4×4 glyph fingerprint of the message, same encoding as ArkanaStrip. */
function fingerprintElements(content: string): Elements[] {
  const hash = createHash("sha256").update(content).digest("hex");
  const binary = BigInt("0x" + hash)
    .toString(2)
    .padStart(256, "0");
  return Array.from({ length: GLYPH_COUNT }, (_, i) =>
    bitsToElements(binary.slice(i * 16, i * 16 + 16))
  );
}

/** rank[i] = position at which glyph i locks during the decode. */
function shuffledRanks(): number[] {
  const order = Array.from({ length: GLYPH_COUNT }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const rank = new Array<number>(GLYPH_COUNT);
  order.forEach((glyph, position) => {
    rank[glyph] = position;
  });
  return rank;
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
}

/**
 * A 4×4 grid of Arkana glyphs that "decodes" into the fingerprint of its
 * message when scrolled into view, then idles with occasional one-glyph
 * flickers. Static (already decoded) under prefers-reduced-motion.
 */
export function DecoderSigil({ content, className }: DecoderSigilProps) {
  const target = useMemo(() => fingerprintElements(content), [content]);
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
        if (anim.locked >= GLYPH_COUNT) {
          anim.mode = "idle";
          anim.cooldown = IDLE_GAP_TICKS;
        }
        return;
      }

      if (anim.mode === "idle") {
        if (anim.cooldown > 0) {
          anim.cooldown -= 1;
          if (anim.cooldown === 0) {
            anim.idleIdx = Math.floor(Math.random() * GLYPH_COUNT);
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
            anim.rank = shuffledRanks();
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
  }, [target]);

  // Playful: re-run the decode on hover once it has settled
  const handleMouseEnter = () => {
    const anim = animRef.current;
    if (reducedRef.current || anim.mode !== "idle") return;
    anim.mode = "decode";
    anim.rank = shuffledRanks();
    anim.locked = 0;
    anim.tick = 0;
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      className={`grid grid-cols-4 ${className ?? ""}`}
      aria-hidden="true"
    >
      {glyphs.map((elements, i) => (
        <ArkanaPattern
          key={i}
          elements={elements}
          canvasSize={canvasSize}
          lineColor="#a777ff"
          backgroundColor="transparent"
        />
      ))}
    </div>
  );
}
