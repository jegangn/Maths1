import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false, // tests share state via localStorage; run sequential
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:9191",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "node scripts/serve-static.mjs",
    env: { PORT: "9191" },
    url: "http://localhost:9191",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  projects: [
    {
      name: "tablet-landscape",
      use: {
        ...devices["Galaxy Tab S4"], // landscape tablet preset
        viewport: { width: 1366, height: 800 },
      },
    },
  ],
});
