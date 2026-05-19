import type { NextConfig } from "next";

// When deploying to GitHub Pages the site lives at jegangn.github.io/Maths1/.
// CI sets NEXT_PUBLIC_BASE_PATH=/Maths1; local builds leave it empty so
// `serve out -l 9191` still works at the root URL.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  basePath,
  // assetPrefix should NOT have a trailing slash here — Next.js appends one.
  assetPrefix: basePath || undefined,
};

export default nextConfig;
