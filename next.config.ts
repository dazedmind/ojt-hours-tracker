import type { NextConfig } from "next";
// @ts-ignore
import { PrismaPlugin } from "@prisma/nextjs-monorepo-workaround-plugin";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
  devIndicators: false,
  experimental: {
    authInterrupts: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()];
      config.externals.push({
        '@prisma/client': 'commonjs @prisma/client',
        '@prisma/adapter-pg': 'commonjs @prisma/adapter-pg',
        'pg': 'commonjs pg',
        'pg-native': 'commonjs pg-native',
      });
    } else {
      // Exclude all Node.js built-in modules from client bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        dgram: false,
        child_process: false,
        stream: false,
        crypto: false,
        path: false,
        os: false,
        util: false,
        buffer: false,
        events: false,
        assert: false,
      };
      
      // Exclude server-only packages from client bundle
      config.externals = config.externals || [];
      config.externals.push({
        'pg': 'pg',
        '@prisma/client': '@prisma/client',
        '@prisma/adapter-pg': '@prisma/adapter-pg',
      });
    }
    return config;
  },
};

export default nextConfig;
