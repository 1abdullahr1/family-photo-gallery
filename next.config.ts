import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Cloudinary natively transforms, compresses, and delivers modern formats (WebP/AVIF).
    // Using unoptimized: true ensures full compatibility with Cloudflare Workers without Node.js Sharp dependency.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
