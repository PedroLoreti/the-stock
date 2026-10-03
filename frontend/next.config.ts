import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emits .next/standalone with a minimal server and traced dependencies; used by the Dockerfile.
  output: "standalone",
};

export default nextConfig;
