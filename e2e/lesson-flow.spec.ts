/**
 * Full lesson flow for add-10-review-01
 *
 * Problems (pre-computed from seed):
 *   Intro (tap):    3+4=7, 2+5=7, 6+3=9
 *   Practice (tap): 2+3=5, 5+3=8, 3+4=7, 3+5=8, 2+4=6
 *   Quiz (type):    2+3=5, 2+3=5, 3+3=6
 */
import { test, expect } from "@playwright/test";

const LESSON_ID = "add-10-review-01";
// Correct answers in order: intro[0..2], practice[0..4], quiz[0..2]
const TAP_ANSWERS = [7, 7, 9, 5, 8, 7, 8, 6];
const TYPE_ANSWERS = [5, 5, 6];

test.beforeEach(async ({ context }) => {
  // Clear localStorage so every run starts fresh
  await context.addInitScript(() => localStorage.clear());
});

test("completes lesson and lands on done page with stars", async ({ page }) => {
  await page.goto(`/lesson/${LESSON_ID}/`);

  // Answer all tap-mode problems (intro + practice)
  for (const answer of TAP_ANSWERS) {
    // Wait for the answer tiles to appear (not disabled)
    await page.waitForSelector('[data-testid="at-tile"]:not([disabled])', {
      timeout: 5_000,
    });

    // Find the tile with the correct value
    const tile = page
      .locator('[data-testid="at-tile"]')
      .filter({ hasText: new RegExp(`^${answer}$`) })
      .first();
    await expect(tile).toBeVisible({ timeout: 5_000 });
    await tile.click();

    // Brief pause for animation (700ms transition between problems)
    await page.waitForTimeout(900);
  }

  // Answer all type-mode problems (quiz)
  for (const answer of TYPE_ANSWERS) {
    // Wait for number pad confirm button to be enabled
    await page.waitForSelector('[data-testid="np-confirm"]:not([disabled])', {
      timeout: 5_000,
    });

    const digits = String(answer).split("");
    for (const digit of digits) {
      await page.locator(`[data-testid="np-${digit}"]`).click();
    }
    await page.locator('[data-testid="np-confirm"]').click();

    // Brief pause for animation
    await page.waitForTimeout(900);
  }

  // Should navigate to /done/
  await page.waitForURL(/\/done/, { timeout: 10_000 });
  expect(page.url()).toContain(`lesson=${LESSON_ID}`);

  const stars = new URL(page.url()).searchParams.get("stars");
  expect(Number(stars)).toBeGreaterThanOrEqual(1);
});
