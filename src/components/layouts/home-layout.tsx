import React from "react";
import ArkanaPattern from "@/components/arkana-pattern";
import { Navbar } from "./navbar";

interface HomeLayoutProps {
  children: React.ReactNode;
  lang: string;
}

export function HomeLayout({ children, lang }: HomeLayoutProps) {
  // Generate a random pattern for each grid cell (static for now)
  const gridHeight = 25;
  const gridRows = 12;

  const patterns = React.useMemo(
    () =>
      Array.from({ length: gridHeight * gridRows }, () => ({
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
      })),
    []
  );

  return (
    <>
      <div className="absolute top-0 left-0 min-h-screen w-full overflow-hidden flex flex-col items-center">
        <div className="grid grid-cols-20 grid-rows-8 w-full h-full">
          {patterns.map((elements, idx) => (
            <ArkanaPattern
              key={idx}
              elements={elements}
              canvasSize={80}
              lineColor="#3d3054"
              backgroundColor="transparent"
              className="w-full h-full"
            />
          ))}
        </div>
        {/* Overlay: fade out bottom and left side of pattern */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              // Layer a radial gradient (bottom fade) and a linear gradient (right-to-left fade)
              `radial-gradient(ellipse 65% 50% at 78% 32%, rgba(24,24,27,0) 60%, var(--background, #18181b) 100%),` +
              `linear-gradient(90deg, var(--background, #18181b) 0%, rgba(24,24,27,0.7) 35%, rgba(24,24,27,0.0) 70%, rgba(24,24,27,0.0) 100%)`,
          }}
        />
      </div>
      <Navbar lang={lang} />
      <div className="relative z-10 w-full max-w-screen-2xl mx-auto">
        {children}
      </div>
    </>
  );
}
