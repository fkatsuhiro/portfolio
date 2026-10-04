// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,

  // In CI, also emit a JSON report (consumed by scripts/a11y-report.mjs to
  // build the GitHub Actions job summary) alongside the usual HTML report.
  reporter: process.env.CI
    ? [
        ["list"],
        ["json", { outputFile: "test-results/results.json" }],
        ["html", { outputFolder: "playwright-report", open: "never" }],
      ]
    : "list",

  projects: process.env.CI
    ? [{ name: "chrome", use: { ...devices["Desktop Chrome"] } }]
    : [
        {
          name: "chrome",
          use: { ...devices["Desktop Chrome"], channel: "chrome" },
        },
      ],

  webServer: {
    command: process.env.CI
      ? "pnpm build && pnpm preview --port 4323"
      : "pnpm dev --port 4323",
    url: "http://localhost:4323/portfolio",
    reuseExistingServer: !process.env.CI,
    timeout: 180 * 1000,
  },

  use: {
    baseURL: "http://localhost:4323/portfolio/",
    trace: "on-first-retry",
  },
});
