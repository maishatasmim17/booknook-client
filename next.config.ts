import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Next.js blocks dev assets/endpoints (including every /_next/static chunk)
  // for origins it does not know about, which leaves the page unhydrated
  // (spinner forever, buttons disabled) when it is opened via 127.0.0.1 or a
  // LAN address. Allow the common local origins in development only.
  // `*` matches exactly one hostname label, so private IPv4 ranges need all
  // four labels spelled out.
  allowedDevOrigins: [
    "127.0.0.1",
    "192.168.*.*",
    "10.*.*.*",
    "172.*.*.*",
    "*.local",
  ],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
