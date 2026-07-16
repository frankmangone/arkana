"use client";

import React, { useEffect, useMemo, useState } from "react";
import ArkanaPattern from "@/components/arkana-pattern";
import type { Pattern } from "@/components/arkana-strip";

const PATTERN_SIZE = 64;

function randomElements(): Pattern["elements"] {
  return {
    left: Math.random() > 0.5,
    right: Math.random() > 0.5,
    top: Math.random() > 0.5,
    bottom: Math.random() > 0.5,
    top_left_ray: Math.random() > 0.5,
    top_right_ray: Math.random() > 0.5,
    bottom_left_ray: Math.random() > 0.5,
    bottom_right_ray: Math.random() > 0.5,
    top_left_left_side: Math.random() > 0.5,
    top_top_left_side: Math.random() > 0.5,
    top_top_right_side: Math.random() > 0.5,
    top_right_right_side: Math.random() > 0.5,
    bottom_right_right_side: Math.random() > 0.5,
    bottom_bottom_right_side: Math.random() > 0.5,
    bottom_bottom_left_side: Math.random() > 0.5,
    bottom_left_left_side: Math.random() > 0.5,
    central_diagonal_1: Math.random() > 0.5,
    central_diagonal_2: Math.random() > 0.5,
  };
}

export function AuthPatternBackground() {
  // Enough columns/rows to tile the whole viewport, edge to edge
  const [grid, setGrid] = useState({ cols: 0, rows: 0 });

  useEffect(() => {
    const updateGrid = () => {
      setGrid({
        cols: Math.ceil(window.innerWidth / PATTERN_SIZE),
        rows: Math.ceil(window.innerHeight / PATTERN_SIZE),
      });
    };

    updateGrid();
    window.addEventListener("resize", updateGrid);
    return () => window.removeEventListener("resize", updateGrid);
  }, []);

  const patterns = useMemo(
    () => Array.from({ length: grid.cols * grid.rows }, randomElements),
    [grid.cols, grid.rows]
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-60 [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black_80%)]">
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${grid.cols}, ${PATTERN_SIZE}px)`,
        }}
      >
        {patterns.map((elements, idx) => (
          <ArkanaPattern
            key={idx}
            elements={elements}
            canvasSize={PATTERN_SIZE}
            lineColor="hsl(260, 60%, 22%)"
            backgroundColor="transparent"
          />
        ))}
      </div>
    </div>
  );
}
