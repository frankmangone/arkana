interface GlyphMosaicProps {
  className?: string;
  cellSize?: number;
}

// One tile of the mosaic, used as a mask: a single diamond outline + center
// dot at the tile's center and at each corner, so alternate rows read as
// offset by half a cell. Black = visible when used as mask-image.
const CELL =
  '<path d="M0,-26 L26,0 L0,26 L-26,0 Z" fill="none" stroke="black" stroke-width="5.5" stroke-linejoin="round"/>' +
  '<path d="M0,-7 L7,0 L0,7 L-7,0 Z" fill="black"/>';

const TILE_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
  [
    [50, 50],
    [0, 0],
    [100, 0],
    [0, 100],
    [100, 100],
  ]
    .map(([x, y]) => `<g transform="translate(${x},${y})">${CELL}</g>`)
    .join("") +
  "</svg>";

const TILE_MASK = `url("data:image/svg+xml,${encodeURIComponent(TILE_SVG)}")`;

/**
 * Flat, staggered mosaic of diamond cells, drawn as a CSS mask over a
 * gradient using the same stops as the widget's --grad-coffee (globals.css)
 * so the pattern matches the card border and button — but running
 * top-to-bottom on desktop and left-to-right on mobile. A second mask layer
 * fades the pattern out toward the bottom on mobile and toward the right on
 * desktop.
 */
export function GlyphMosaic({ className = "", cellSize = 64 }: GlyphMosaicProps) {
  return (
    <div
      aria-hidden="true"
      className={`[--mosaic-grad:linear-gradient(to_right,#bc3f7e,#f5745b,#ffd270)] md:[--mosaic-grad:linear-gradient(to_bottom,#bc3f7e,#f5745b,#ffd270)] [--fade:linear-gradient(to_bottom,black_65%,transparent_95%)] md:[--fade:linear-gradient(to_right,black_72%,transparent_98%)] ${className}`}
      style={{
        backgroundImage: "var(--mosaic-grad)",
        opacity: 0.9,
        maskImage: `${TILE_MASK}, var(--fade)`,
        maskSize: `${cellSize}px ${cellSize}px, 100% 100%`,
        maskRepeat: "repeat, no-repeat",
        maskComposite: "intersect",
        WebkitMaskImage: `${TILE_MASK}, var(--fade)`,
        WebkitMaskSize: `${cellSize}px ${cellSize}px, 100% 100%`,
        WebkitMaskRepeat: "repeat, no-repeat",
        WebkitMaskComposite: "source-in",
      }}
    />
  );
}
