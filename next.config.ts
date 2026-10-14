import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pg + the Prisma driver adapter run in the Node.js runtime, not bundled.
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg"],
  // Prisma loads its query-compiler WASM with fs at runtime — ship it for serverless.
  outputFileTracingIncludes: { "/**": ["./node_modules/.prisma/client/*.wasm"] },
  poweredByHeader: false,
};

export default nextConfig;
