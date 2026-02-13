import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
typescript: {
    ignoreBuildErrors: true,  // Skip TS/Prisma validation during build
  },
};

export default nextConfig;
