import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    // Photos uploaded on Vercel live on Blob storage rather than in public/,
    // so next/image has to be told that host is allowed.
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
    // The studio photographs are ~2MB PNGs at 1536x1024. Served as they are,
    // one category page pulled 23MB down the wire; re-encoded to AVIF at the
    // size the card actually occupies, the same page is a fraction of that.
    // AVIF first, WebP for browsers that can't take it, original as the floor.
    formats: ["image/avif", "image/webp"],
    // A blob URL names one immutable file — the uploader mints a new name for
    // every upload — so there is nothing to invalidate and no reason to
    // re-encode the same photograph every four hours.
    minimumCacheTTL: 2678400, // 31 days
  },
  // "standalone" is for running the app from a Docker image, where the server
  // has to be self-contained. Vercel builds its own serverless output and the
  // standalone tree only confuses it, so this is opt-in via the env var the
  // Dockerfile sets rather than always on.
  ...(process.env.BUILD_STANDALONE === "true" ? { output: "standalone" as const } : {}),
};

export default nextConfig;
