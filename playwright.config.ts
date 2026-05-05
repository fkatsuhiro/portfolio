// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,

  projects: process.env.CI
    ? [{ name: "chrome", use: { ...devices["Desktop Chrome"] } }]
    : [
        { name: "webkit", use: { ...devices["Desktop Safari"] } },
        { name: "chrome", use: { ...devices["Desktop Chrome"] } },
      ],

  webServer: {
    command: process.env.CI ? "pnpm build && pnpm preview --port 4323" : "pnpm dev --port 4323",
    url: "http://localhost:4323/portfolio",
    reuseExistingServer: !process.env.CI,
    timeout: 180 * 1000,
  },

  use: {
    baseURL: "http://localhost:4323/portfolio/",
    trace: "on-first-retry",
  },
});
