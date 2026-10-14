import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: { alias: { "server-only": fileURLToPath(new URL("./tests/server-only-stub.ts", import.meta.url)) } },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    env: {
      DATABASE_URL: process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/wasla?schema=public",
      APP_URL: "http://localhost:3002",
      EMAIL_DEV_LINKS: "1",
      CHECKOUT_TEST_MODE: "1",
      GEMINI_API_KEY: "",
    },
  },
});
