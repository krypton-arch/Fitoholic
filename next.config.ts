import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["zustand"],
  turbopack: {
    resolveAlias: {
      'zustand/middleware': './node_modules/zustand/middleware.js',
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'zustand/middleware': path.resolve(__dirname, 'node_modules/zustand/middleware.js'),
    };
    return config;
  },
};

export default nextConfig;
