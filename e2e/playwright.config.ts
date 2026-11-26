import { env } from 'node:process'
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: '.',
  outputDir: '../test-results/e2e',
  use: {
    baseURL: env.REQUESTO_E2E_URL ?? 'http://127.0.0.1:5173',
    browserName: 'chromium',
    trace: 'retain-on-failure',
  },
})
