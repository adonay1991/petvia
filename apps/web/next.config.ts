import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@petvia/ui", "@petvia/db"],
  experimental: {
    // Enable React Compiler when available
    // reactCompiler: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;
