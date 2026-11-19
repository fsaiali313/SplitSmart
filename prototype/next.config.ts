import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // The Codespaces port proxy can preserve the local browser origin while forwarding its public host.
      allowedOrigins: process.env.CODESPACES === "true" ? ["localhost:3000"] : [],
    },
  },
};

export default nextConfig;
