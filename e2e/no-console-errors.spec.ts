import { test, expect } from "@playwright/test";

const ROUTES = [
  "/",
  "/lesson/add-10-review-01/",
  "/lesson/add-20-make-ten-01/",
  "/lesson/sub-10-countback-01/",
  "/lesson/mul-groups-01/",
  "/parent/",
  "/done/?stars=3",
];

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => localStorage.clear());
});

for (const route of ROUTES) {
  test(`no console errors on ${route}`, async ({ page }) => {
    const errors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(`[console.error] ${msg.text()}`);
      }
      if (msg.type() === "warning") {
        const text = msg.text();
        // Fail on React hydration mismatches and missing-key warnings
        if (
          text.includes("Hydration") ||
          text.includes("hydration") ||
          text.includes("Each child in a list") ||
          text.includes("missing key") ||
          text.includes("did not match")
        ) {
          errors.push(`[console.warn] ${text}`);
        }
      }
    });

    page.on("pageerror", (err) => {
      errors.push(`[pageerror] ${err.message}`);
    });

    await page.goto(route);

    // Wait for React to hydrate / page to settle
    await page
      .waitForLoadState("networkidle", { timeout: 10_000 })
      .catch(() => {
        // networkidle can be unreliable with SW; just continue
      });
    // Extra tick to let deferred React effects flush
    await page.waitForTimeout(500);

    expect(errors).toEqual([]);
  });
}
