import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Widen the project root to the parent dir that also contains
  // arkana-content, so imports resolving through the src/data symlinks
  // (which point outside this repo) are allowed. Next copies this into
  // turbopack.root, which is what actually lifts Turbopack's resolution
  // boundary (its own schema key lags in 15.3, hence this spelling).
  outputFileTracingRoot: path.join(__dirname, ".."),
  output: "export", // Enables static HTML export
  distDir: "out", // Output directory
  images: {
    unoptimized: true, // Required for static export
  },
  basePath: "",
  assetPrefix: "",
  trailingSlash: true, // Add trailing slashes for GitHub Pages compatibility
  // appDir: true,
};

export default nextConfig;
