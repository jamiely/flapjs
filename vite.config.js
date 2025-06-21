import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8', // or 'c8' for C8 provider
      reportsDirectory: './coverage',
      reporter: ['text', 'lcov', 'json-summary'], // formats
      all: true, // include files not tested
      exclude: [...configDefaults.exclude, 'src/generated/**'],
    },
    environment: "jsdom",
    globals: true,
  },
});
