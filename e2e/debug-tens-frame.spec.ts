/**
 * Debug spec: tens-frame visualisation investigation
 * Checks for console errors, counts filled cells, and captures a screenshot.
 */
import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => localStorage.clear());
});

test("tens-frame: dots visible, no console errors", async ({ page }) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(`[console.error] ${msg.text()}`);
    }
    if (msg.type() === "warning") {
      consoleErrors.push(`[console.warn] ${msg.text()}`);
    }
  });

  page.on("pageerror", (err) => {
    pageErrors.push(`[pageerror] ${err.message}`);
  });

  await page.goto("/lesson/add-10-review-01/");

  // Wait for React to hydrate
  await page
    .waitForLoadState("networkidle", { timeout: 10_000 })
    .catch(() => {});
  await page.waitForTimeout(800);

  // Count filled cells by colour group
  const filledA = await page
    .locator('[data-testid="tf-cell-filled-a"]')
    .count();
  const filledB = await page
    .locator('[data-testid="tf-cell-filled-b"]')
    .count();
  const filledCells = filledA + filledB;
  const allCells = await page
    .locator(
      '[data-testid="tf-cell"], [data-testid="tf-cell-filled-a"], [data-testid="tf-cell-filled-b"]',
    )
    .count();

  console.log(`\n=== TENS FRAME DEBUG ===`);
  console.log(`Total cells: ${allCells} (should be 10)`);
  console.log(
    `Filled cells: ${filledCells} (first problem 3+4: 3 orange + 4 blue = 7)`,
  );
  console.log(`  Orange (tf-cell-filled-a): ${filledA} (should be 3)`);
  console.log(`  Blue   (tf-cell-filled-b): ${filledB} (should be 4)`);

  // Count visible orange dots inside the tens frame
  // A dot is "visible" if it's not scaled to 0
  const orangeDots = await page
    .locator(
      '[data-testid="tf-cell-filled-a"] > div, [data-testid="tf-cell-filled-b"] > div',
    )
    .count();
  console.log(`Dot elements inside filled cells: ${orangeDots}`);

  // Check transform styles on dots (scale:0 means invisible)
  const dotStyles = await page
    .locator(
      '[data-testid="tf-cell-filled-a"] > div, [data-testid="tf-cell-filled-b"] > div',
    )
    .evaluateAll((els) => els.map((el) => (el as HTMLElement).style.transform));
  console.log(`Dot transforms: ${JSON.stringify(dotStyles)}`);

  // Read problem from answer tiles (the answer tiles reveal what the answer is)
  const tileTexts = await page
    .locator('[data-testid="at-tile"]')
    .allTextContents();
  console.log(`Answer tiles: ${tileTexts.join(", ")}`);

  // Read speech bubble
  const speechBubble = await page
    .locator(".bg-white.border-4.border-ink\\/80.rounded-2xl.p-4")
    .textContent()
    .catch(() => "N/A");
  console.log(`Speech bubble: ${speechBubble}`);

  // Console errors
  console.log(
    `Console errors (${consoleErrors.length}): ${JSON.stringify(consoleErrors)}`,
  );
  console.log(
    `Page errors (${pageErrors.length}): ${JSON.stringify(pageErrors)}`,
  );

  // Screenshot — save to e2e-screenshots/
  const screenshotDir = path.join(process.cwd(), "e2e-screenshots");
  if (!fs.existsSync(screenshotDir))
    fs.mkdirSync(screenshotDir, { recursive: true });
  await page.screenshot({
    path: path.join(screenshotDir, "after-fix.png"),
    fullPage: false,
  });
  console.log(`Screenshot saved to e2e-screenshots/after-fix.png`);

  // Assertions
  expect(allCells).toBe(10);
  // First problem is 3+4: p.a=3 orange (tf-cell-filled-a) + p.b=4 blue (tf-cell-filled-b)
  expect(filledA).toBe(3);
  expect(filledB).toBe(4);
  expect(filledCells).toBe(7);

  // All dots should be visible (not scale:0)
  for (const transform of dotStyles) {
    expect(transform).not.toBe("scale(0)");
    // Should be empty string (no transform override) or scale(1)
    const isVisible =
      transform === "" ||
      transform === "none" ||
      transform.includes("scale(1)") ||
      transform === "scale(1, 1)";
    expect(isVisible).toBe(true);
  }
});
