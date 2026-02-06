"use client";

import React from "react";

interface CommentIconProps {
  size?: number;
  color?: string;
  className?: string;
}

const CommentIcon: React.FC<CommentIconProps> = ({
  size,
  color,
  className = "",
}) => {
  // Determine color class based on filled state if not explicitly provided
  const colorClass = color ?? "text-secondary-800";
  
  // If size is provided, use it; otherwise, make it fill the container
  const sizeClass = size ? "" : "w-full h-full";

  // Contour lines for the comment shape (in 5x5 grid coordinates)
  const contourLines = [
    { from: [0, 2], to: [2, 4] },
    { from: [2, 4], to: [2.5, 3.5] },
    { from: [2.5, 3.5], to: [4, 4] },
    { from: [4, 4], to: [3.3, 2.7] },
    { from: [3.3, 2.7], to: [4, 2] },
    { from: [4, 2], to: [2, 0] },
    { from: [2, 0], to: [0, 2] },
  ];

  const filledCenterPath = "M 1 2 L 2 3 L 3 2 L 2 1 Z";

  return (
    <svg
      {...(size ? { width: size, height: size } : {})}
      viewBox="0 0 4 4"
      className={`${colorClass} ${sizeClass} ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={size ? { width: `${size}px`, height: `${size}px`, flexShrink: 0 } : undefined}
    >
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
          <path
            d={filledCenterPath}
            fill="currentColor"
            stroke="none"
          />
    </svg>
  );
};

export default CommentIcon;
