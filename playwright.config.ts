import { defineConfig, devices } from '@playwright/test';

const headed = process.env.HEADED === 'true';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: Number(process.env.PW_WORKERS ?? 1),
  retries: Number(process.env.PW_RETRIES ?? 0),
  timeout: 120_000,
  expect: { timeout: 120_000 },
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
    ['allure-playwright', { resultsDir: 'allure-results' }],
  ],
  use: {
    ...devices['Desktop Chrome'],
    browserName: 'chromium',
    headless: headed,
    actionTimeout: 120_000,
    navigationTimeout: 120_000,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
});
