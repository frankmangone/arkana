"use client";

import React, { useEffect, useRef } from "react";
import { Pattern } from "./arkana-strip";

interface ArkanaPatternProps {
  elements: Pattern["elements"];
  canvasSize?: number;
  lineWidth?: number;
  lineColor?: string;
  backgroundColor?: string;
  className?: string;
}

const ArkanaPattern: React.FC<ArkanaPatternProps> = ({
  elements,
  canvasSize = 60,
  lineWidth = 2,
  lineColor = "#800080",
  backgroundColor = "#f8f8f8",
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Vertex coordinates calculated from grid position
  const getVertexCoordinates = (gridX: number, gridY: number, size: number) => {
    const cellSize = size / 16; // Grid is 17x17 vertices, so 16 cells
    return {
      x: gridX * cellSize,
      y: gridY * cellSize,
    };
  };

  // Draw a line between two grid vertices
  const drawLine = (
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    size: number
  ) => {
    const from = getVertexCoordinates(fromX, fromY, size);
    const to = getVertexCoordinates(toX, toY, size);

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  };

  // Draw a filled polygon
  const drawFilledPolygon = (
    ctx: CanvasRenderingContext2D,
    vertices: [number, number][],
    size: number
  ) => {
    if (vertices.length < 3) return;

    ctx.beginPath();
    const first = getVertexCoordinates(vertices[0][0], vertices[0][1], size);
    ctx.moveTo(first.x, first.y);

    for (let i = 1; i < vertices.length; i++) {
      const point = getVertexCoordinates(vertices[i][0], vertices[i][1], size);
      ctx.lineTo(point.x, point.y);
    }

    ctx.closePath();
    ctx.fill();
  };

  // Draw the pattern
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear the canvas before drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Clear canvas and set background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Set line style for pattern elements
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = lineColor;
    ctx.fillStyle = lineColor;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (elements.left) drawLine(ctx, 0, 8, 4, 8, canvasSize);
    if (elements.right) drawLine(ctx, 16, 8, 12, 8, canvasSize);

    if (elements.top) drawLine(ctx, 8, 0, 8, 4, canvasSize);
    if (elements.bottom) drawLine(ctx, 8, 16, 8, 12, canvasSize);

    if (elements.top_left_ray) drawLine(ctx, 6, 6, 3, 3, canvasSize);
    if (elements.top_right_ray) drawLine(ctx, 6, 10, 3, 13, canvasSize);
    if (elements.bottom_left_ray) drawLine(ctx, 10, 6, 13, 3, canvasSize);
    if (elements.bottom_right_ray) drawLine(ctx, 10, 10, 13, 13, canvasSize);

    if (elements.top_left_left_side) drawLine(ctx, 4, 8, 6, 6, canvasSize);
    if (elements.top_top_left_side) drawLine(ctx, 6, 6, 8, 4, canvasSize);
    if (elements.top_top_right_side) drawLine(ctx, 10, 6, 8, 4, canvasSize);
    if (elements.top_right_right_side) drawLine(ctx, 12, 8, 10, 6, canvasSize);

    if (elements.bottom_right_right_side)
      drawLine(ctx, 4, 8, 6, 10, canvasSize);
    if (elements.bottom_bottom_right_side)
      drawLine(ctx, 6, 10, 8, 12, canvasSize);
    if (elements.bottom_bottom_left_side)
      drawLine(ctx, 10, 10, 8, 12, canvasSize);
    if (elements.bottom_left_left_side)
      drawLine(ctx, 12, 8, 10, 10, canvasSize);

    // Draw central diamond
    if (elements.central_diagonal_1 && elements.central_diagonal_2) {
      drawFilledPolygon(
        ctx,
        [
          [8, 7],
          [7, 8],
          [8, 9],
          [9, 8],
        ],
        canvasSize
      );

      return;
    }

    if (!elements.central_diagonal_1) {
      drawLine(ctx, 6, 6, 10, 10, canvasSize);
    }

    if (!elements.central_diagonal_2) {
      drawLine(ctx, 10, 6, 6, 10, canvasSize);
    }
  }, [elements, canvasSize, lineWidth, lineColor, backgroundColor]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasSize}
      height={canvasSize}
      className={className}
    />
  );
};

export default ArkanaPattern;
