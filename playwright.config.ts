import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

// QA suite — verifies critical paths render correctly. Runs headless, in
// parallel, no videos by default (only on failure). The narrative demo
// suite lives in playwright.demo.config.ts and shares the same step library.
const testDir = defineBddConfig({
  features: 'e2e/features/*.feature',
  steps: 'e2e/steps/*.ts',
});

const e2ePort = Number(process.env.E2E_PORT ?? 4200);
if (!Number.isInteger(e2ePort) || e2ePort < 1 || e2ePort > 65_535) {
  throw new Error(`E2E_PORT must be a valid TCP port, received: ${process.env.E2E_PORT ?? ''}`);
}
const e2eBaseURL = `http://localhost:${e2ePort}`;

export default defineConfig({
  testDir,
  // 60s per-test timeout because the dev server cold-starts ng serve on
  // first request. After warm-up most tests finish in 2-3s.
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: e2eBaseURL,
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // ng serve is slow to boot the first time (~30s); be generous on the wait.
  // Skip if the dev server is already running locally.
  webServer: {
    command: `npm start -- --port ${e2ePort}`,
    url: e2eBaseURL,
    reuseExistingServer: !process.env.CI && !process.env.E2E_PORT,
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
