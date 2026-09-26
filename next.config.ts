import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    // Photos uploaded on Vercel live on Blob storage rather than in public/,
    // so next/image has to be told that host is allowed.
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
  // "standalone" is for running the app from a Docker image, where the server
  // has to be self-contained. Vercel builds its own serverless output and the
  // standalone tree only confuses it, so this is opt-in via the env var the
  // Dockerfile sets rather than always on.
  ...(process.env.BUILD_STANDALONE === "true" ? { output: "standalone" as const } : {}),
};

export default nextConfig;
