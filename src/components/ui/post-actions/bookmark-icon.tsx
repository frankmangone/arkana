"use client";

import React from "react";

interface BookmarkIconProps {
  filled?: boolean;
  size?: number;
  color?: string;
  className?: string;
}

const BookmarkIcon: React.FC<BookmarkIconProps> = ({
  filled = false,
  size,
  color,
  className = "",
}) => {
  // Determine color class based on filled state if not explicitly provided
  const colorClass = color ?? (filled ? "text-secondary-750" : "text-secondary-800");
  
  // If size is provided, use it; otherwise, make it fill the container
  const sizeClass = size ? "" : "w-full h-full";

  // Contour lines for the bookmark shape (in 4x4 grid coordinates)
  const contourLines = [
    { from: [0, 0], to: [4, 0] },
    { from: [4, 0], to: [4, 4] },
    { from: [4, 4], to: [2, 2] },
    { from: [2, 2], to: [0, 4] },
    { from: [0, 4], to: [0, 0] },
  ];

  // For filled version, create a closed path following the contour
  const filledPath = filled
    ? `M 0 0 L 4 0 L 4 4 L 2 2 L 0 4 Z`
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
        </>
      )}
    </svg>
  );
};

export default BookmarkIcon;
