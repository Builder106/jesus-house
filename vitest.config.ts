import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
      include: ['src/app/**/*.ts', 'src/server.ts'],
      exclude: ['src/**/*.spec.ts', 'src/main.ts', 'src/main.server.ts'],
    },
  },
});
