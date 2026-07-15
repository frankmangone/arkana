"use client";

import React, { useEffect, useRef } from "react";

interface GlyphRainProps {
  className?: string;
  /** Size of each glyph cell in px */
  cellSize?: number;
  /** Trail color */
  color?: string;
  /** Color of the leading glyph in each column */
  headColor?: string;
}

// Line segments of the 17×17 Arkana glyph grid, keyed by the same 16 bits
// the ArkanaStrip uses (left/right arms are always drawn).
const SEGMENTS: Array<[number, number, number, number]> = [
  [8, 0, 8, 4], // top
  [8, 16, 8, 12], // bottom
  [6, 6, 3, 3], // top_left_ray
  [6, 10, 3, 13], // top_right_ray
  [10, 6, 13, 3], // bottom_left_ray
  [10, 10, 13, 13], // bottom_right_ray
  [4, 8, 6, 6], // top_left_left_side
  [6, 6, 8, 4], // top_top_left_side
  [10, 6, 8, 4], // top_top_right_side
  [12, 8, 10, 6], // top_right_right_side
  [4, 8, 6, 10], // bottom_right_right_side
  [6, 10, 8, 12], // bottom_bottom_right_side
  [10, 10, 8, 12], // bottom_bottom_left_side
  [12, 8, 10, 10], // bottom_left_left_side
];

const TRAIL_LENGTH = 9;
const STEP_MS = 120;

function drawGlyph(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bits: number,
  strokeStyle: string,
  alpha: number
) {
  const pad = size * 0.14;
  const inner = size - pad * 2;
  const unit = inner / 16;
  const px = (gx: number) => x + pad + gx * unit;
  const py = (gy: number) => y + pad + gy * unit;

  ctx.globalAlpha = alpha;
  ctx.strokeStyle = strokeStyle;
  ctx.fillStyle = strokeStyle;
  ctx.lineWidth = Math.max(1, size / 36);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.beginPath();
  // Left/right arms are always present
  ctx.moveTo(px(0), py(8));
  ctx.lineTo(px(4), py(8));
  ctx.moveTo(px(16), py(8));
  ctx.lineTo(px(12), py(8));

  SEGMENTS.forEach(([x1, y1, x2, y2], i) => {
    if (bits & (1 << i)) {
      ctx.moveTo(px(x1), py(y1));
      ctx.lineTo(px(x2), py(y2));
    }
  });

  // Central diamond / diagonals — bits 14 and 15
  const d1 = bits & (1 << 14);
  const d2 = bits & (1 << 15);
  if (d1 && d2) {
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(px(8), py(7));
    ctx.lineTo(px(7), py(8));
    ctx.lineTo(px(8), py(9));
    ctx.lineTo(px(9), py(8));
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
    return;
  }
  if (!d1) {
    ctx.moveTo(px(6), py(6));
    ctx.lineTo(px(10), py(10));
  }
  if (!d2) {
    ctx.moveTo(px(10), py(6));
    ctx.lineTo(px(6), py(10));
  }
  ctx.stroke();
  ctx.globalAlpha = 1;
}

/**
 * GlyphRain — a matrix-style rain of Arkana glyphs on a canvas.
 * Falls back to a static field when the user prefers reduced motion.
 */
export function GlyphRain({
  className = "",
  cellSize = 44,
  color = "hsl(260, 60%, 18%)",
  headColor = "#f8f5ff",
}: GlyphRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let lastStep = 0;
    let cols = 0;
    let rows = 0;
    let heads: Array<{ row: number; every: number; tick: number }> = [];
    let glyphs: number[][] = [];

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const randomBits = () => Math.floor(Math.random() * 0x10000);

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(rect.width / cellSize);
      rows = Math.ceil(rect.height / cellSize) + 1;
      heads = Array.from({ length: cols }, () => ({
        row: Math.floor(Math.random() * rows),
        every: 1 + Math.floor(Math.random() * 3),
        tick: 0,
      }));
      glyphs = Array.from({ length: cols }, () =>
        Array.from({ length: rows }, randomBits)
      );
      if (reducedMotion) drawStatic(rect.width, rect.height);
    };

    const drawStatic = (w: number, h: number) => {
      ctx.clearRect(0, 0, w, h);
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          drawGlyph(
            ctx,
            c * cellSize,
            r * cellSize,
            cellSize,
            glyphs[c][r],
            color,
            0.15 + Math.random() * 0.35
          );
        }
      }
    };

    const step = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      for (let c = 0; c < cols; c++) {
        const head = heads[c];
        head.tick += 1;
        if (head.tick >= head.every) {
          head.tick = 0;
          head.row = (head.row + 1) % rows;
          glyphs[c][head.row] = randomBits();
        }
        for (let d = 0; d < TRAIL_LENGTH; d++) {
          const r = (head.row - d + rows) % rows;
          const fade = Math.pow(1 - d / TRAIL_LENGTH, 1.6);
          drawGlyph(
            ctx,
            c * cellSize,
            r * cellSize,
            cellSize,
            glyphs[c][r],
            d === 0 ? headColor : color,
            d === 0 ? 0.9 : fade * 0.75
          );
        }
      }
    };

    const loop = (ts: number) => {
      if (ts - lastStep >= STEP_MS) {
        lastStep = ts;
        step();
      }
      raf = requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener("resize", resize);
    if (!reducedMotion) raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [cellSize, color, headColor]);

  return (
    <canvas
      ref={canvasRef}
      className={`h-full w-full ${className}`}
      aria-hidden="true"
    />
  );
}
