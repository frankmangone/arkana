"use client";

import React from "react";

interface LikeIconProps {
  filled?: boolean;
  size?: number;
  color?: string;
  className?: string;
}

const LikeIcon: React.FC<LikeIconProps> = ({
  filled = false,
  size,
  color,
  className = "",
}) => {
  // Determine color class based on filled state if not explicitly provided
  const colorClass = color ?? (filled ? "text-secondary-750" : "text-secondary-800");
  
  // If size is provided, use it; otherwise, make it fill the container
  const sizeClass = size ? "" : "w-full h-full";

  // Contour lines for the heart shape (in 5x5 grid coordinates)
  const contourLines = [
    { from: [0, 1.5], to: [1, 0.5] },
    { from: [0, 1.5], to: [2, 3.5] },
    { from: [2, 3.5], to: [4, 1.5] },
    { from: [4, 1.5], to: [3, 0.5] },
    { from: [3, 0.5], to: [2, 1.5] },
    { from: [2, 1.5], to: [1, 0.5] },
  ];

  // Additional lines for non-filled version
  const nonFilledLines = [
    { from: [2, 1.5], to: [1, 2.5] },
    { from: [2, 1.5], to: [3, 2.5] },
  ];

  // For filled version, create a closed path following the contour
  const filledPath = filled
    ? `M 0 1.5 L 1 0.5 L 2 1.5 L 3 0.5 L 4 1.5 L 2 3.5 Z`
    : null;

  return (
    <svg
      {...(size ? { width: size, height: size } : {})}
      viewBox="0 0 4 4"
      className={`${colorClass} ${sizeClass} ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={size ? { width: `${size}px`, height: `${size}px`, flexShrink: 0 } : undefined}
    >
      {filled && filledPath ? (
        // Filled version: use a closed path
        <path
          d={filledPath}
          fill="currentColor"
          stroke="none"
        />
      ) : (
        // Non-filled version: draw lines
        <>
          {contourLines.map((line, index) => (
            <line
              key={`contour-${index}`}
              x1={line.from[0]}
              y1={line.from[1]}
              x2={line.to[0]}
              y2={line.to[1]}
              stroke="currentColor"
              strokeWidth={0.3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {nonFilledLines.map((line, index) => (
            <line
              key={`non-filled-${index}`}
              x1={line.from[0]}
              y1={line.from[1]}
              x2={line.to[0]}
              y2={line.to[1]}
              stroke="currentColor"
              strokeWidth={0.3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </>
      )}
    </svg>
  );
};

export default LikeIcon;
