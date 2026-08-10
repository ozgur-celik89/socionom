import { defineConfig } from "vitest/config";

/**
 * Röktesterna kör mot en riktig server och delar därför inget med
 * enhetstesterna – varken alias eller mockad next/cache.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // Servern startas en gång; parallella filer skulle slåss om porten.
    fileParallelism: false,
    hookTimeout: 120_000,
  },
});
