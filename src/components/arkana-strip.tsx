"use client";

import { createHash } from "crypto";
import ArkanaPattern from "./arkana-pattern";
import { useEffect, useState } from "react";

export interface Pattern {
  digit: number;
  elements: {
    left: boolean;
    right: boolean;
    top: boolean;
    bottom: boolean;

    top_left_ray: boolean;
    top_right_ray: boolean;
    bottom_left_ray: boolean;
    bottom_right_ray: boolean;

    top_left_left_side: boolean;
    top_top_left_side: boolean;
    top_top_right_side: boolean;
    top_right_right_side: boolean;
    bottom_right_right_side: boolean;
    bottom_bottom_right_side: boolean;
    bottom_bottom_left_side: boolean;
    bottom_left_left_side: boolean;

    central_diagonal_1: boolean;
    central_diagonal_2: boolean;
  };
}

interface ArkanaStripProps {
  content?: string;
  randomSeed?: bigint;
  className?: string;
}

export function ArkanaStrip({
  content,
  randomSeed,
  className,
}: ArkanaStripProps) {
  const [canvasSize, setCanvasSize] = useState(48);

  useEffect(() => {
    const updateSize = () => {
      // Four tiers:
      // - 48px for large screens (>= 1024px)
      // - 42px for medium screens (>= 768px)
      // - 36px for small screens (>= 640px)
      // - 28px for extra small screens (< 640px)
      const size =
        window.innerWidth >= 1024
          ? 48
          : window.innerWidth >= 768
          ? 42
          : window.innerWidth >= 640
          ? 36
          : 28;
      setCanvasSize(size);
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Generate patterns based on content or random seed
  const generatePatterns = (): Pattern[] => {
    let binaryString: string;

    if (content) {
      // Generate SHA-256 hash of the content
      const hash = createHash("sha256").update(content).digest("hex");
      binaryString = BigInt("0x" + hash)
        .toString(2)
        .padStart(256, "0");
    } else if (randomSeed) {
      // Use provided random seed
      binaryString = randomSeed.toString(2).padStart(256, "0");
    } else {
      // Generate a random 256-bit number if neither content nor seed is provided
      const randomParts = new Uint32Array(8);
      for (let i = 0; i < 8; i++) {
        randomParts[i] = Math.floor(Math.random() * 0xffffffff);
      }
      let result = BigInt(0);
      for (let i = 0; i < 8; i++) {
        result = (result << BigInt(32)) | BigInt(randomParts[i]);
      }
      binaryString = result.toString(2).padStart(256, "0");
    }

    // Create 16 patterns from the 256-bit string
    const patterns: Pattern[] = [];
    for (let i = 0; i < 16; i++) {
      const startBit = i * 16;
      const symbolBits = binaryString.slice(startBit, startBit + 16);

      const pattern: Pattern = {
        digit: i,
        elements: {
          left: true,
          right: true,

          top: symbolBits[0] === "1",
          bottom: symbolBits[1] === "1",

          top_left_ray: symbolBits[2] === "1",
          top_right_ray: symbolBits[3] === "1",
          bottom_left_ray: symbolBits[4] === "1",
          bottom_right_ray: symbolBits[5] === "1",

          top_left_left_side: symbolBits[6] === "1",
          top_top_left_side: symbolBits[7] === "1",
          top_top_right_side: symbolBits[8] === "1",
          top_right_right_side: symbolBits[9] === "1",
          bottom_right_right_side: symbolBits[10] === "1",
          bottom_bottom_right_side: symbolBits[11] === "1",
          bottom_bottom_left_side: symbolBits[12] === "1",
          bottom_left_left_side: symbolBits[13] === "1",

          central_diagonal_1: symbolBits[14] === "1",
          central_diagonal_2: symbolBits[15] === "1",
        },
      };

      patterns.push(pattern);
    }

    return patterns;
  };

  const patterns = generatePatterns();

  return (
    <div
      className={`flex flex-wrap justify-center min-h-[28px] sm:min-h-[36px] md:min-h-[42px] lg:min-h-[48px] my-4 ${
        className ?? ""
      }`}
    >
      {patterns.map((pattern, index) => (
        <ArkanaPattern
          key={index}
          elements={pattern.elements}
          canvasSize={canvasSize}
          lineColor="#a777ff"
          backgroundColor="transparent"
        />
      ))}
    </div>
  );
}
