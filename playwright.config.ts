// Module responsible for configuring Tapak browser end-to-end validation.
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 45_000,
  expect: { timeout: 8_000 },
  use: {
    baseURL: 'http://127.0.0.1:4173',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'pnpm --filter @tapak/api start:test',
      port: 4100,
      reuseExistingServer: false,
      timeout: 30_000,
    },
    {
      command: 'pnpm --filter @tapak/web preview --host 127.0.0.1',
      port: 4173,
      reuseExistingServer: false,
      timeout: 30_000,
    },
    {
      command: 'node scripts/static-server.mjs',
      port: 4174,
      reuseExistingServer: false,
      timeout: 30_000,
    },
  ],
});
