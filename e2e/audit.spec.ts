/**
 * Visual audit — captures 20 screenshots across every meaningful screen state.
 * One long sequential test; never bails on missing elements — logs failure and continues.
 * Run with: bunx playwright test e2e/audit.spec.ts --reporter=list
 */
import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

const SCREENSHOT_DIR = path.join(process.cwd(), "e2e-screenshots", "audit");
const STORAGE_KEY = "mathTutor.v1";

/** Collected console/page errors across the whole run */
const consoleErrors: string[] = [];
const pageErrors: string[] = [];
const failedRequests: string[] = [];

/** Safe screenshot helper — never throws */
async function snap(
  page: import("@playwright/test").Page,
  name: string,
  note: string,
) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  const filePath = path.join(SCREENSHOT_DIR, name);
  await page.screenshot({ path: filePath, fullPage: false });
  console.log(`[SNAP] ${name} — ${note}`);
  return filePath;
}

/** Safe click — catches and logs if selector not found */
async function safeClick(
  page: import("@playwright/test").Page,
  selector: string,
  timeout = 5000,
) {
  try {
    await page.waitForSelector(selector, { timeout });
    await page.click(selector);
    return true;
  } catch (e) {
    console.log(`[FAIL] safeClick(${selector}): ${(e as Error).message}`);
    return false;
  }
}

/** Answer a tap-mode problem by clicking the correct tile */
async function answerTap(
  page: import("@playwright/test").Page,
  answer: number,
  waitMs = 900,
) {
  try {
    await page.waitForSelector('[data-testid="at-tile"]:not([disabled])', {
      timeout: 5000,
    });
    const tile = page
      .locator('[data-testid="at-tile"]')
      .filter({ hasText: new RegExp(`^${answer}$`) })
      .first();
    await tile.click();
    await page.waitForTimeout(waitMs);
    return true;
  } catch (e) {
    console.log(`[FAIL] answerTap(${answer}): ${(e as Error).message}`);
    return false;
  }
}

/** Answer a type-mode problem via the number pad */
async function answerType(
  page: import("@playwright/test").Page,
  answer: number,
  waitMs = 900,
) {
  try {
    await page.waitForSelector('[data-testid="np-confirm"]:not([disabled])', {
      timeout: 5000,
    });
    for (const digit of String(answer).split("")) {
      await page.locator(`[data-testid="np-${digit}"]`).click();
    }
    await page.locator('[data-testid="np-confirm"]').click();
    await page.waitForTimeout(waitMs);
    return true;
  } catch (e) {
    console.log(`[FAIL] answerType(${answer}): ${(e as Error).message}`);
    return false;
  }
}

/** Inject fake completed-lesson progress into localStorage */
async function injectProgress(
  page: import("@playwright/test").Page,
  lessonId: string,
  stars = 3,
) {
  await page.evaluate(
    ({ key, lid, s }) => {
      const blob = {
        version: 1,
        profile: { name: "Child", createdAt: "2026-05-18" },
        currentLessonId: lid + "-next",
        lessons: {
          [lid]: {
            stars: s,
            firstTryAccuracy: 1.0,
            attempts: 1,
            completedAt: new Date().toISOString(),
          },
        },
        skillMastery: {},
        sessionHistory: [
          { date: "2026-05-18", minutesSpent: 8, lessonsCompleted: 1 },
        ],
        failedAttemptCounts: {},
      };
      localStorage.setItem(key, JSON.stringify(blob));
    },
    { key: STORAGE_KEY, lid: lessonId, s: stars },
  );
}

test.setTimeout(120_000);

test("visual audit — 20 screenshots", async ({ page, context }) => {
  // ── Wire up error collectors ──────────────────────────────────────────────
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const text = msg.text();
      // Skip browser extension noise
      if (
        !text.includes("Dark Reader") &&
        !text.includes("Extension") &&
        !consoleErrors.includes(text)
      ) {
        consoleErrors.push(text);
      }
    }
  });
  page.on("pageerror", (err) => {
    const msg = err.message;
    if (!pageErrors.includes(msg)) pageErrors.push(msg);
  });
  page.on("requestfailed", (req) => {
    const entry = `${req.method()} ${req.url()} — ${req.failure()?.errorText}`;
    if (!failedRequests.includes(entry)) failedRequests.push(entry);
  });

  // Force 1366×800 landscape tablet
  await page.setViewportSize({ width: 1366, height: 800 });

  // ── 01 — Home empty ───────────────────────────────────────────────────────
  await context.addInitScript(() => localStorage.clear());
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await snap(
    page,
    "01-home-empty.png",
    "Home / lesson map — no progress. All lessons visible? Mascot on first stone?",
  );

  // ── 02 — Home scrolled right ──────────────────────────────────────────────
  await page.evaluate(() => {
    const el = document.querySelector(".overflow-x-auto") as HTMLElement | null;
    if (el) el.scrollLeft = el.scrollWidth;
  });
  await page.waitForTimeout(300);
  await snap(
    page,
    "02-home-scrolled-right.png",
    "Home scrolled fully right — last lessons visible, multiplication track?",
  );

  // ── 03 — Tens-frame intro (first problem, before any tap) ─────────────────
  await page.evaluate(() => localStorage.clear());
  await page.goto("/lesson/add-10-review-01/");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
  await snap(
    page,
    "03-tens-frame-intro.png",
    "Tens-frame intro (3+4=7): both addends shown? Orange dots for 3, blue for 4?",
  );

  // ── 04 — Tens-frame practice (after all 3 intro problems) ─────────────────
  // Intro: 3+4=7, 2+5=7, 6+3=9
  const INTRO_ANSWERS = [7, 7, 9];
  for (const ans of INTRO_ANSWERS) {
    await answerTap(page, ans);
  }
  await page.waitForTimeout(400);
  await snap(
    page,
    "04-tens-frame-practice.png",
    "Tens-frame practice problem 1 — manipulative shows problem, answer tiles present?",
  );

  // ── 05 — Tens-frame quiz (after all 5 practice problems) ──────────────────
  // Practice seed: add-10-review-01-practice → 2+3=5, 5+3=8, 3+4=7, 3+5=8, 2+4=6
  const PRACTICE_ANSWERS = [5, 8, 7, 8, 6];
  for (const ans of PRACTICE_ANSWERS) {
    await answerTap(page, ans);
  }
  await page.waitForTimeout(400);
  await snap(
    page,
    "05-tens-frame-quiz.png",
    "Tens-frame quiz — NumberPad visible? Manipulative collapsed/reference visible?",
  );

  // ── 06 — Add-10-review-03 intro (number-bond lessons removed) ────────────
  await page.evaluate(() => localStorage.clear());
  await page.goto("/lesson/add-10-review-03/");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
  await snap(
    page,
    "06-add-10-review-03.png",
    "add-10-review-03 intro (6+3): tens-frame manipulative, answer tiles present?",
  );

  // ── 07 — Double tens-frame ────────────────────────────────────────────────
  await page.evaluate(() => localStorage.clear());
  await page.goto("/lesson/add-20-make-ten-01/");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
  await snap(
    page,
    "07-double-tens-frame.png",
    "Double-tens-frame (9+4=13): left frame filled 9 orange, right frame 4 blue? Two frames side by side?",
  );

  // ── 08 — Place-value blocks ───────────────────────────────────────────────
  await page.evaluate(() => localStorage.clear());
  await page.goto("/lesson/add-100-01/");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
  await snap(
    page,
    "08-place-value-blocks.png",
    "Place-value blocks: tens rods + ones cubes visible? Represents first addend?",
  );

  // ── 09 — Number-line ──────────────────────────────────────────────────────
  await page.evaluate(() => localStorage.clear());
  await page.goto("/lesson/sub-10-countback-01/");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
  await snap(
    page,
    "09-number-line.png",
    "Number-line: horizontal line 0-20 visible? Frog positioned at p.a? Readable scale?",
  );

  // ── 10 — Equal groups ─────────────────────────────────────────────────────
  await page.evaluate(() => localStorage.clear());
  await page.goto("/lesson/mul-groups-01/");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
  await snap(
    page,
    "10-equal-groups.png",
    "Equal groups (3×2): 3 plates shown with 2 cookies each? Plates large enough to tap?",
  );

  // ── 11 — Array grid ───────────────────────────────────────────────────────
  await page.evaluate(() => localStorage.clear());
  await page.goto("/lesson/mul-arrays-01/");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
  await snap(
    page,
    "11-array-grid.png",
    "Array grid: rows × cols dot grid visible? Both dimensions clear? Rotation button present?",
  );

  // ── 12 — Correct-answer feedback state ────────────────────────────────────
  await page.evaluate(() => localStorage.clear());
  await page.goto("/lesson/add-10-review-01/");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
  // First intro problem 3+4=7 — tap correct answer without waiting for transition
  try {
    await page.waitForSelector('[data-testid="at-tile"]:not([disabled])', {
      timeout: 5000,
    });
    const tile = page
      .locator('[data-testid="at-tile"]')
      .filter({ hasText: /^7$/ })
      .first();
    await tile.click();
    // Capture immediately while feedback animation is playing
    await page.waitForTimeout(150);
    await snap(
      page,
      "12-correct-answer.png",
      "Correct feedback: green pulse/burst visible? Mascot happy state? Tiles disabled?",
    );
  } catch (e) {
    console.log(`[FAIL] correct-answer screenshot: ${(e as Error).message}`);
  }

  // ── 13 — Wrong-answer feedback state ──────────────────────────────────────
  await page.evaluate(() => localStorage.clear());
  await page.goto("/lesson/add-10-review-01/");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
  // Tap a WRONG answer — the tiles are shuffled, so find one that is NOT 7
  try {
    await page.waitForSelector('[data-testid="at-tile"]:not([disabled])', {
      timeout: 5000,
    });
    // Get all tile texts
    const tiles = page.locator('[data-testid="at-tile"]');
    const count = await tiles.count();
    let tappedWrong = false;
    for (let i = 0; i < count; i++) {
      const text = (await tiles.nth(i).textContent())?.trim() ?? "";
      if (text !== "7") {
        await tiles.nth(i).click();
        tappedWrong = true;
        break;
      }
    }
    if (tappedWrong) {
      await page.waitForTimeout(150);
      await snap(
        page,
        "13-wrong-answer.png",
        "Wrong feedback: shake animation? Mascot encouraging state? Wrong tile highlighted?",
      );
    } else {
      console.log("[FAIL] Could not find a wrong tile");
    }
  } catch (e) {
    console.log(`[FAIL] wrong-answer screenshot: ${(e as Error).message}`);
  }

  // ── 14 — Done page 3 stars ────────────────────────────────────────────────
  await page.goto("/done/?stars=3");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
  await snap(
    page,
    "14-done-3-stars.png",
    "Done page 3 stars: 3 stars shown? Mascot celebrating? Next button present?",
  );

  // ── 15 — Done page 1 star ─────────────────────────────────────────────────
  await page.goto("/done/?stars=1");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
  await snap(
    page,
    "15-done-1-star.png",
    "Done page 1 star: only 1 star shown? Mascot still celebrating (same) or different?",
  );

  // ── 16 — Parent view empty ────────────────────────────────────────────────
  await page.evaluate(() => localStorage.clear());
  await page.goto("/parent/");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(300);
  await snap(
    page,
    "16-parent-empty.png",
    "Parent view empty: fields show 0/none defaults? Export + Reset buttons present?",
  );

  // ── 17 — Parent view with progress ───────────────────────────────────────
  await injectProgress(page, "add-10-review-01", 3);
  await page.reload();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(300);
  await snap(
    page,
    "17-parent-with-progress.png",
    "Parent view with progress: shows completed lesson count, current lesson ID?",
  );

  // ── 18 — Portrait home (turn-tablet overlay) ──────────────────────────────
  await page.setViewportSize({ width: 800, height: 1366 });
  await page.evaluate(() => localStorage.clear());
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
  await snap(
    page,
    "18-portrait-home.png",
    "Portrait 800×1366: 'Turn tablet' overlay visible? Or lessons crammed into narrow view?",
  );
  // Restore landscape
  await page.setViewportSize({ width: 1366, height: 800 });

  // ── 19 — Invalid lesson ───────────────────────────────────────────────────
  await page.goto("/lesson/this-does-not-exist/");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(300);
  await snap(
    page,
    "19-invalid-lesson.png",
    "Invalid lesson ID: shows graceful error message? No crash?",
  );

  // ── 20 — Lesson after reload (state persistence) ──────────────────────────
  try {
    await page.evaluate(() => localStorage.clear());
    await page.goto("/lesson/add-10-review-01/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);
    // Answer 2 intro problems correctly
    await answerTap(page, 7); // problem 1: 3+4=7
    await answerTap(page, 7); // problem 2: 2+5=7
    // Now reload mid-lesson
    await page.reload();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);
    await snap(
      page,
      "20-lesson-after-reload.png",
      "Mid-lesson reload: resumes at same problem (problem 3)? Or resets to problem 1? State in URL or localStorage?",
    );
  } catch (e) {
    console.log(
      `[FAIL] screenshot 20 (lesson-after-reload): ${(e as Error).message}`,
    );
  }

  // ── 21 — Multiplication intro tiles include correct answer (3×4=12) ──────
  await page.evaluate(() => localStorage.clear());
  await page.goto("/lesson/mul-arrays-01/");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
  await snap(
    page,
    "21-mul-arrays-tiles.png",
    "mul-arrays-01 intro (3×4): answer tiles visible? Should include 12 not 7?",
  );

  // ── 22 — Subtraction intro tiles include correct answer (5−2=3) ──────────
  await page.evaluate(() => localStorage.clear());
  await page.goto("/lesson/sub-5-takeaway-01/");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
  await snap(
    page,
    "22-sub-takeaway-tiles.png",
    "sub-5-takeaway-01 intro (5−2): answer tiles visible? Should include 3 not 7?",
  );

  // ── Final: print accumulated errors ──────────────────────────────────────
  console.log("\n═══════════════════════════════════════");
  console.log("CONSOLE ERRORS COLLECTED:");
  if (consoleErrors.length === 0) {
    console.log("  (none)");
  } else {
    consoleErrors.forEach((e, i) => console.log(`  [CE${i + 1}] ${e}`));
  }

  console.log("\nPAGE ERRORS COLLECTED:");
  if (pageErrors.length === 0) {
    console.log("  (none)");
  } else {
    pageErrors.forEach((e, i) => console.log(`  [PE${i + 1}] ${e}`));
  }

  console.log("\nFAILED NETWORK REQUESTS:");
  if (failedRequests.length === 0) {
    console.log("  (none)");
  } else {
    failedRequests.forEach((e, i) => console.log(`  [NF${i + 1}] ${e}`));
  }
  console.log("═══════════════════════════════════════\n");

  // The test always passes — we're auditing, not asserting correctness
  expect(true).toBe(true);
});
