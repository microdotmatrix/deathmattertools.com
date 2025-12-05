import bundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  cacheComponents: true,
  cacheLife: {
    // For user-specific dashboard data - short cache, frequent revalidation
    dashboard: {
      stale: 60, // 1 minute client staleness OK
      revalidate: 30, // Server revalidates every 30s
      expire: 300, // Max 5 minutes before forced refresh
    },
    // For entry/document detail pages - moderate caching
    content: {
      stale: 300, // 5 minutes client staleness OK
      revalidate: 60, // Server revalidates every minute
      expire: 3600, // Max 1 hour
    },
    // For comments - short cache for real-time feel
    realtime: {
      stale: 30, // 30 seconds
      revalidate: 15, // 15 seconds
      expire: 120, // 2 minutes max
    },
    // For static/semi-static content - long cache
    static: {
      stale: 3600, // 1 hour
      revalidate: 1800, // 30 minutes
      expire: 86400, // 1 day
    },
  },
  experimental: {
    viewTransition: true,
    useLightningcss: true,
    authInterrupts: true,
    // Enable optimized package imports
    optimizePackageImports: [
      "lucide-react",
      "date-fns",
      "@radix-ui/react-icons",
      "motion",
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    minimumCacheTTL: 3600, // 1 hour
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.ufs.sh",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
};

export default withBundleAnalyzer(nextConfig);
