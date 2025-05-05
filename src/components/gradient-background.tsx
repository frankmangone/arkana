"use client";

import { useEffect, useRef } from "react";

export function GradientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Function to update canvas size when window resizes
    const updateCanvasSize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      renderGradient();
    };

    // Set initial canvas size
    updateCanvasSize();

    // Add resize listener
    window.addEventListener("resize", updateCanvasSize);

    // Function to render the gradient
    function renderGradient() {
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Create gradient
      const gradient = createColorfulGradient(ctx, canvas.width, canvas.height);

      // Apply gradient with vertical fade
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create a gradient mask for fading
      const fadeHeight = canvas.height * 0.6; // Fade out at 60% of screen height
      const fadeGradient = ctx.createLinearGradient(0, 0, 0, fadeHeight);
      fadeGradient.addColorStop(0, "rgba(255, 255, 255, 0.2)"); // 30% opacity at top
      fadeGradient.addColorStop(1, "rgba(255, 255, 255, 0)"); // 0% opacity at bottom

      // Fill with main gradient
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Apply the fade mask
      ctx.globalCompositeOperation = "destination-in";
      ctx.fillStyle = fadeGradient;
      ctx.fillRect(0, 0, canvas.width, fadeHeight);

      // Reset composite operation
      ctx.globalCompositeOperation = "source-over";
    }

    // Function to create a colorful gradient like in the image
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
      // TODO: Make this dynamic
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
      window.removeEventListener("resize", updateCanvasSize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none"
      aria-hidden="true"
    />
  );
}
