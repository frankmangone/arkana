import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // Enables static HTML export
  distDir: "out", // Output directory
  images: {
    unoptimized: true, // Required for static export
  },
  basePath: process.env.NODE_ENV === "production" ? "/personal-blog" : "", // Replace with your GitHub repo name
  trailingSlash: true, // Add trailing slashes for GitHub Pages compatibility
  appDir: true,
};

export default nextConfig;
