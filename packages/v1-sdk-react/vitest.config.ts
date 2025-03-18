import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: 'jsdom',
    watch: false,
    globals: true,
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: './test-output/vitest/coverage',
      provider: 'v8',
    },
  },
});
