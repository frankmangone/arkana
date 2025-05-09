"use client";

import React, { useState, useEffect } from "react";
import ArkanaPattern from "./arkana-pattern";

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

const ArkanaStrip = () => {
  const canvasSize = 55; // Smaller canvas size

  // Generate a proper 256-bit random number
  const generate256BitNumber = () => {
    // Create an array of 8 32-bit random numbers
    const randomParts = new Uint32Array(8);
    for (let i = 0; i < 8; i++) {
      randomParts[i] = Math.floor(Math.random() * 0xffffffff);
    }

    // Combine them into a single BigInt
    let result = BigInt(0);
    for (let i = 0; i < 8; i++) {
      result = (result << BigInt(32)) | BigInt(randomParts[i]);
    }
    return result;
  };

  const [randomNumber] = useState(generate256BitNumber());
  const [patterns, setPatterns] = useState<Pattern[]>([]);

  // Break down the number into digit patterns
  useEffect(() => {
    // Convert number to binary string and pad to 256 bits
    const binaryString = randomNumber.toString(2).padStart(256, "0");

    // Create pattern for each symbol (12 symbols total)
    const newPatterns: Pattern[] = [];
    for (let i = 0; i < 16; i++) {
      const startBit = i * 16;
      const symbolBits = binaryString.slice(startBit, startBit + 16);

      // Create a pattern based on the binary representation
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

          // Central diamond
          central_diagonal_1: symbolBits[14] === "1",
          central_diagonal_2: symbolBits[15] === "1",
        },
      };

      newPatterns.push(pattern);
    }

    setPatterns(newPatterns);
  }, [randomNumber]);

  return (
    <div className="flex flex-col items-center justify-center mb-12">
      <div className="flex flex-wrap justify-center min-h-[55px]">
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
    </div>
  );
};

export default ArkanaStrip;
