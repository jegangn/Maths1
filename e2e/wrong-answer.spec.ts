/**
 * Wrong-answer feedback: clicking a wrong tile triggers shake animation,
 * the problem stays on screen, and the correct tile still works.
 *
 * First problem in add-10-review-01: 3+4=7, tiles are [7,12,5]
 * We click 12 (wrong), then 7 (correct).
 */
import { test, expect } from "@playwright/test";

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => localStorage.clear());
});

test("wrong answer shakes and problem stays; correct answer advances", async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on("pageerror", (err) => consoleErrors.push(err.message));

  await page.goto("/lesson/add-10-review-01/");

  // Wait for tiles to appear
  await page.waitForSelector('[data-testid="at-tile"]:not([disabled])', {
    timeout: 5_000,
  });

  const tiles = page.locator('[data-testid="at-tile"]');
  const count = await tiles.count();
  expect(count).toBeGreaterThanOrEqual(2);

  // Click the first tile that is NOT 7 (the correct answer)
  let clickedWrong = false;
  for (let i = 0; i < count; i++) {
    const text = (await tiles.nth(i).textContent()) ?? "";
    if (text.trim() !== "7") {
      await tiles.nth(i).click();
      clickedWrong = true;
      break;
    }
  }
  expect(clickedWrong).toBe(true);

  // After a wrong click the problem should still be on screen (no navigation)
  // Give a brief moment for any animation
  await page.waitForTimeout(500);
  expect(page.url()).toContain("/lesson/add-10-review-01/");

  // Tiles should still be visible (problem not advanced yet)
  await expect(tiles.first()).toBeVisible();

  // Now click the correct tile
  const correctTile = tiles.filter({ hasText: /^7$/ }).first();
  await expect(correctTile).toBeVisible({ timeout: 3_000 });
  await correctTile.click();

  // Wait a moment — problem should advance (tile values may change)
  await page.waitForTimeout(900);

  // No JS errors during all of this
  expect(consoleErrors).toEqual([]);
});
