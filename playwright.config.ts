import { defineConfig, devices } from "@playwright/test";

const port = process.env.PORT ?? "3000";
const baseURL = `http://localhost:${port}`;

/* oxlint-disable sort-keys */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  ...(process.env.CI && { retries: 2 }),
  ...(process.env.CI && { workers: 1 }),
  reporter: [
    ["list"],
    ["html", { open: "never" }],
    ["json", { outputFile: "reports/results.json" }],
    ...(process.env.CI ? [["github"] as const] : []),
  ],
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
  webServer: {
    command: process.env.CI ? "bun run build && bun start" : "bun dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
});
