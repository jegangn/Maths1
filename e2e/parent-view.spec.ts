import { test, expect } from "@playwright/test";

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => localStorage.clear());
});

test("parent view reachable via 5 taps and shows current lesson", async ({
  page,
}) => {
  await page.goto("/");

  // Wait for the version button to appear
  const versionBtn = page.locator("button", { hasText: /v\d+\.\d+/ });
  await expect(versionBtn).toBeVisible({ timeout: 8_000 });

  // Click 5 times quickly (within 3 seconds)
  for (let i = 0; i < 5; i++) {
    await versionBtn.click();
  }

  // Should navigate to /parent/
  await page.waitForURL(/\/parent/, { timeout: 5_000 });
  await expect(page.locator("text=Current lesson")).toBeVisible({
    timeout: 5_000,
  });
});

test("export progress triggers download without errors", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("pageerror", (err) => consoleErrors.push(err.message));

  await page.goto("/parent/");

  // Wait for the export button
  const exportBtn = page.locator("button", { hasText: /Export progress/i });
  await expect(exportBtn).toBeVisible({ timeout: 5_000 });

  // Click and expect a download event
  const [download] = await Promise.all([
    page.waitForEvent("download", { timeout: 5_000 }),
    exportBtn.click(),
  ]);

  expect(download.suggestedFilename()).toContain("progress");
  expect(consoleErrors).toEqual([]);
});
