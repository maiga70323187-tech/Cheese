import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@brand": path.resolve(__dirname, "src/brand"),
      "@scenario": path.resolve(__dirname, "src/scenario"),
      "@engine": path.resolve(__dirname, "src/engine"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
    passWithNoTests: false,
  },
});
