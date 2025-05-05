"use client";

import { useEffect, useRef } from "react";

export function GradientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dimensionsRef = useRef({ width: 0, height: 0 });
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Function to update canvas size
    const updateCanvasSize = () => {
      if (!canvas) return;

      // Store dimensions in ref
      dimensionsRef.current = {
        width: window.innerWidth,
        height: window.innerHeight,
      };

      // Render the gradient with new dimensions
      renderGradient();
    };

    // Function to handle resize with debounce
    const handleResize = () => {
      // Clear previous timeout
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }

      // Set a new timeout to update canvas size after resize ends
      resizeTimeoutRef.current = setTimeout(() => {
        updateCanvasSize();
      }, 100);
    };

    // Set initial size and render
    updateCanvasSize();

    // Add resize listener with debounce
    window.addEventListener("resize", handleResize);

    // Function to render the gradient
    function renderGradient() {
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Get current dimensions from ref
      const { width, height } = dimensionsRef.current;

      // Apply dimensions to canvas
      canvas.width = width;
      canvas.height = height;

      // Create gradient
      const gradient = createColorfulGradient(ctx, width, height);

      // Apply gradient with vertical fade
      ctx.clearRect(0, 0, width, height);

      // Create a gradient mask for fading
      const fadeHeight = height * 0.6; // Fade out at 60% of screen height
      const fadeGradient = ctx.createLinearGradient(0, 0, 0, fadeHeight);
      fadeGradient.addColorStop(0, "rgba(255, 255, 255, 0.2)"); // 30% opacity at top
      fadeGradient.addColorStop(1, "rgba(255, 255, 255, 0)"); // 0% opacity at bottom

      // Fill with main gradient
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Apply the fade mask
      ctx.globalCompositeOperation = "destination-in";
      ctx.fillStyle = fadeGradient;
      ctx.fillRect(0, 0, width, fadeHeight);

      // Reset composite operation
      ctx.globalCompositeOperation = "source-over";
    }

    // Function to create a colorful gradient
    function createColorfulGradient(
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number
    ) {
      // Create a radial gradient
      const gradient = ctx.createRadialGradient(
        width * 0.3,
        height * 0.2,
        0, // Inner circle center and radius
        width * 0.5,
        height * 0.5,
        width * 0.8 // Outer circle center and radius
      );

      // Add colorful stops with primary theme colors
      gradient.addColorStop(0, "#ffffff"); // White center
      gradient.addColorStop(0.2, "#dad2ea"); // Light purple (--primary-800)
      gradient.addColorStop(0.4, "#c6b4e7"); // Medium purple (--primary-700)
      gradient.addColorStop(0.6, "#b79cea"); // Primary-600
      gradient.addColorStop(0.8, "#a777ff"); // Primary-500
      gradient.addColorStop(0.95, "#8041f4"); // Primary-400

      return gradient;
    }

    // Clean up
    return () => {
      window.removeEventListener("resize", handleResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, []); // Empty dependency array

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none"
      aria-hidden="true"
    />
  );
}
