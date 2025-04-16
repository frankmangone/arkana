import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // Enables static HTML export
  distDir: "out", // Output directory
  images: {
    unoptimized: true, // Required for static export
  },
  basePath: "/personal-blog", // For production
  assetPrefix: "/personal-blog/", // For production
  trailingSlash: true, // Add trailing slashes for GitHub Pages compatibility
  transpilePackages: ["tw-animate-css"],
  // appDir: true,
};

export default nextConfig;
