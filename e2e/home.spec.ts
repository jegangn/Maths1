import { test, expect } from "@playwright/test";

test("home page renders lesson map with no console errors", async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(err.message));

  const response = await page.goto("/");
  expect(response?.status()).toBe(200);

  // Wait for React hydration to complete — at least one stone visible
  await expect(page.locator("a[href^='/lesson/']").first()).toBeVisible({
    timeout: 10_000,
  });

  // Mascot image should be present on the current stone
  const mascot = page.locator('[data-testid="mascot-img"]').first();
  await expect(mascot).toBeVisible();

  expect(consoleErrors).toEqual([]);
});
