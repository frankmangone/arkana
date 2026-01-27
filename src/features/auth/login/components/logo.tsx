"use client";

import React, { useEffect, useRef } from "react";
import type { Pattern } from "@/components/arkana-strip";

interface LogoProps {
  canvasSize?: number;
  lineWidth?: number;
  lineColor?: string;
  backgroundColor?: string;
  className?: string;
}

export function Logo({
  canvasSize = 120,
  lineWidth = 6,
  lineColor = "hsl(262, 80%, 64%)",
  backgroundColor = "transparent",
  className = "",
}: LogoProps) {
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
  // Only adjusts endpoints that are at canvas edges to ensure rounded caps are visible
  const drawLine = (
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    size: number,
    lineWidth: number
  ) => {
    const from = getVertexCoordinates(fromX, fromY, size);
    const to = getVertexCoordinates(toX, toY, size);
    
    // Check if endpoints are at canvas edges (0 or 16 in grid coordinates)
    const isFromAtEdge = fromX === 0 || fromX === 16 || fromY === 0 || fromY === 16;
    const isToAtEdge = toX === 0 || toX === 16 || toY === 0 || toY === 16;
    
    let adjustedFrom = { x: from.x, y: from.y };
    let adjustedTo = { x: to.x, y: to.y };
    
    // Only adjust endpoints that are at the edge
    if (isFromAtEdge || isToAtEdge) {
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      
      if (length > 0) {
        // Normalize direction
        const nx = dx / length;
        const ny = dy / length;
        const offset = lineWidth / 2;
        
        // Only offset if the endpoint is at the edge
        if (isFromAtEdge) {
          adjustedFrom = {
            x: from.x + nx * offset,
            y: from.y + ny * offset,
          };
        }
        
        if (isToAtEdge) {
          adjustedTo = {
            x: to.x - nx * offset,
            y: to.y - ny * offset,
          };
        }
      }
    }

    ctx.beginPath();
    ctx.moveTo(adjustedFrom.x, adjustedFrom.y);
    ctx.lineTo(adjustedTo.x, adjustedTo.y);
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

    // Full pattern with all elements enabled for logo
    const elements: Pattern["elements"] = {
      left: true,
      right: true,
      top: true,
      bottom: true,
      top_left_ray: true,
      top_right_ray: true,
      bottom_left_ray: true,
      bottom_right_ray: true,
      top_left_left_side: true,
      top_top_left_side: true,
      top_top_right_side: true,
      top_right_right_side: true,
      bottom_right_right_side: true,
      bottom_bottom_right_side: true,
      bottom_bottom_left_side: true,
      bottom_left_left_side: true,
      central_diagonal_1: true,
      central_diagonal_2: true,
    };

    if (elements.left) drawLine(ctx, 0, 8, 4, 8, canvasSize, lineWidth);
    if (elements.right) drawLine(ctx, 16, 8, 12, 8, canvasSize, lineWidth);

    if (elements.top) drawLine(ctx, 8, 0, 8, 4, canvasSize, lineWidth);
    if (elements.bottom) drawLine(ctx, 8, 16, 8, 12, canvasSize, lineWidth);

    if (elements.top_left_ray) drawLine(ctx, 5.7, 5.7, 3, 3, canvasSize, lineWidth);
    if (elements.top_right_ray) drawLine(ctx, 5.7, 10.3, 3, 13, canvasSize, lineWidth);
    if (elements.bottom_left_ray) drawLine(ctx, 10.3, 5.7, 13, 3, canvasSize, lineWidth);
    if (elements.bottom_right_ray) drawLine(ctx, 10.3, 10.3, 13, 13, canvasSize, lineWidth);

    if (elements.top_left_left_side) drawLine(ctx, 4, 8, 6, 6, canvasSize, lineWidth);
    if (elements.top_top_left_side) drawLine(ctx, 6, 6, 8, 4, canvasSize, lineWidth);
    if (elements.top_top_right_side) drawLine(ctx, 10, 6, 8, 4, canvasSize, lineWidth);
    if (elements.top_right_right_side) drawLine(ctx, 12, 8, 10, 6, canvasSize, lineWidth);

    if (elements.bottom_right_right_side)
      drawLine(ctx, 4, 8, 6, 10, canvasSize, lineWidth);
    if (elements.bottom_bottom_right_side)
      drawLine(ctx, 6, 10, 8, 12, canvasSize, lineWidth);
    if (elements.bottom_bottom_left_side)
      drawLine(ctx, 10, 10, 8, 12, canvasSize, lineWidth);
    if (elements.bottom_left_left_side)
      drawLine(ctx, 12, 8, 10, 10, canvasSize, lineWidth);

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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasSize, lineWidth, lineColor, backgroundColor]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasSize}
      height={canvasSize}
      className={className}
    />
  );
}
