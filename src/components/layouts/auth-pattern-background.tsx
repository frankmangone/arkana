"use client";

import React, { useEffect, useState, useMemo } from "react";
import ArkanaPattern from "@/components/arkana-pattern";
import type { Pattern } from "@/components/arkana-strip";

export function AuthPatternBackground() {
  const patterns = useMemo(() => {
    // Generate random patterns for the background - more dense grid
    const cols = 20;
    const rows = 16;
    const patternCount = cols * rows; // 320 patterns for dense coverage
    return Array.from({ length: patternCount }, () => ({
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
    } as Pattern["elements"]));
  }, []);

  // Calculate positions for patterns in a dense grid that touch each other
  const [patternSize, setPatternSize] = useState(60);
  const [gridOffset, setGridOffset] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    // Calculate pattern size based on viewport to ensure they touch
    const updatePatternSize = () => {
      const cols = 20;
      const rows = 16;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Calculate size so patterns fit exactly and touch
      const widthBasedSize = Math.floor(viewportWidth / cols);
      const heightBasedSize = Math.floor(viewportHeight / rows);
      
      // Use the smaller one to ensure they fit, or a minimum size
      const calculatedSize = Math.max(40, Math.min(widthBasedSize, heightBasedSize));
      setPatternSize(calculatedSize);
      
      // Calculate offset to center the grid
      const totalGridWidth = cols * calculatedSize;
      const totalGridHeight = rows * calculatedSize;
      const offsetX = (viewportWidth - totalGridWidth) / 2;
      const offsetY = (viewportHeight - totalGridHeight) / 2;
      setGridOffset({ x: offsetX, y: offsetY });
    };
    
    updatePatternSize();
    window.addEventListener('resize', updatePatternSize);
    return () => window.removeEventListener('resize', updatePatternSize);
  }, []);
  
  const patternPositions = useMemo(() => {
    const cols = 20;
    const rows = 16;
    const positions: Array<{ x: number; y: number }> = [];
    
    // Calculate positions so patterns touch (no gaps) and are centered
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        positions.push({
          x: gridOffset.x + (col * patternSize) + (patternSize / 2), // Center of each pattern, offset for centering
          y: gridOffset.y + (row * patternSize) + (patternSize / 2), // Center of each pattern, offset for centering
        });
      }
    }
    
    return positions;
  }, [patternSize, gridOffset]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Patterns positioned around the center */}
      <div className="absolute inset-0">
        {patterns.slice(0, patternPositions.length).map((elements, idx) => {
          const pos = patternPositions[idx];
          return (
            <div
              key={idx}
              className="absolute"
              style={{
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                transform: "translate(-50%, -50%)",
                width: `${patternSize}px`,
                height: `${patternSize}px`,
              }}
            >
              <ArkanaPattern
                elements={elements}
                canvasSize={patternSize}
                lineColor="hsl(262, 40%, 26%)"
                backgroundColor="transparent"
                className="w-full h-full"
              />
            </div>
          );
        })}
        
        {/* Fade overlay - fades patterns to background color around the center */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at center, transparent 0%, transparent 25%, rgba(24, 24, 27, 0.3) 45%, rgb(24, 24, 27) 70%, rgb(24, 24, 27) 100%)',
          }}
        />
      </div>
    </div>
  );
}
