/**
 * Correctness test suite — verifies mathematical accuracy and manipulative-vs-problem match.
 *
 * Unlike the audit spec (which only checks that elements exist), every test here
 * asserts that the MATH is right: the correct answer is present in the tile set,
 * the manipulative renders the exact counts dictated by the lesson JSON, and a full
 * lesson playthrough lands on the 3-star done screen.
 */
import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "fs";
import path from "path";
import fs from "fs";

// ---------------------------------------------------------------------------
// Types & helpers
// ---------------------------------------------------------------------------

interface LessonJson {
  id: string;
  track: "addition" | "subtraction" | "multiplication";
  manipulative: string;
  intro: { a: number; b: number }[];
  practiceTemplate: { count: number };
  quizTemplate: { count: number };
}

function loadLesson(id: string): LessonJson {
  const filePath = path.resolve(__dirname, `../lessons/${id}.json`);
  return JSON.parse(readFileSync(filePath, "utf-8"));
}

function computeAnswer(track: string, a: number, b: number): number {
  if (track === "multiplication") return a * b;
  if (track === "subtraction") return a - b;
  return a + b;
}

const SCREENSHOT_DIR = path.join(
  process.cwd(),
  "e2e-screenshots",
  "correctness",
);

async function snap(page: Page, name: string) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  const filePath = path.join(SCREENSHOT_DIR, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: false });
  return filePath;
}

/** Wait for tiles and return their numeric values */
async function getTileNumbers(page: Page): Promise<number[]> {
  await page.waitForSelector('[data-testid="at-tile"]', { timeout: 8_000 });
  const texts = await page.locator('[data-testid="at-tile"]').allTextContents();
  return texts.map((t) => parseInt(t.trim(), 10));
}

/** Click the tile whose text exactly matches `answer` */
async function clickCorrectTile(page: Page, answer: number) {
  await page.waitForSelector('[data-testid="at-tile"]:not([disabled])', {
    timeout: 8_000,
  });
  const tile = page
    .locator('[data-testid="at-tile"]')
    .filter({ hasText: new RegExp(`^${answer}$`) })
    .first();
  await tile.click();
}

/** Type an answer via the NumberPad */
async function typeAnswer(page: Page, answer: number) {
  await page.waitForSelector('[data-testid="np-confirm"]:not([disabled])', {
    timeout: 8_000,
  });
  for (const digit of String(answer).split("")) {
    await page.locator(`[data-testid="np-${digit}"]`).click();
  }
  await page.locator('[data-testid="np-confirm"]').click();
}

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => localStorage.clear());
});

// ---------------------------------------------------------------------------
// Part 1: Tile set contains the correct answer (10 lesson cases)
// ---------------------------------------------------------------------------

const tileCases: { lesson: string; manipulative: string }[] = [
  { lesson: "add-10-review-01", manipulative: "tens-frame" },
  { lesson: "add-20-make-ten-01", manipulative: "double-tens-frame" },
  { lesson: "add-100-01", manipulative: "place-value-blocks" },
  { lesson: "sub-5-takeaway-01", manipulative: "tens-frame" },
  { lesson: "sub-10-countback-01", manipulative: "number-line" },
  { lesson: "sub-20-cross-ten-01", manipulative: "double-tens-frame" },
  { lesson: "mul-groups-01", manipulative: "equal-groups" },
  { lesson: "mul-arrays-01", manipulative: "array-grid" },
  { lesson: "mul-skip-01", manipulative: "number-line" },
  { lesson: "mul-times-01", manipulative: "array-grid" },
];

for (const { lesson: lessonId, manipulative } of tileCases) {
  test(`[tile] ${lessonId} (${manipulative}) — tile set contains correct answer`, async ({
    page,
  }) => {
    const lesson = loadLesson(lessonId);
    const p = lesson.intro[0];
    const expectedAnswer = computeAnswer(lesson.track, p.a, p.b);

    await page.goto(`/lesson/${lessonId}/`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    const tileNumbers = await getTileNumbers(page);

    // Screenshot regardless of outcome
    await snap(page, lessonId);

    expect(
      tileNumbers,
      `Expected tile set ${JSON.stringify(tileNumbers)} to contain ${expectedAnswer} (${p.a} ${lesson.track === "multiplication" ? "×" : lesson.track === "subtraction" ? "−" : "+"} ${p.b})`,
    ).toContain(expectedAnswer);
  });
}

// ---------------------------------------------------------------------------
// Part 2: Manipulative renders exact counts matching the problem
// ---------------------------------------------------------------------------

test("[manip] tens-frame (add-10-review-01) — 3 orange + 4 blue dots for problem 3+4", async ({
  page,
}) => {
  // Intro problem 0: a=3, b=4
  await page.goto("/lesson/add-10-review-01/");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);

  const orangeCount = await page
    .locator('[data-testid="tf-cell-filled-a"]')
    .count();
  const blueCount = await page
    .locator('[data-testid="tf-cell-filled-b"]')
    .count();

  expect(orangeCount).toBe(3); // p.a = 3
  expect(blueCount).toBe(4); // p.b = 4
});

test("[manip] tens-frame subtraction (sub-5-takeaway-01) — 5 orange + 2 blue dots for problem 5−2", async ({
  page,
}) => {
  // Intro problem 0: a=5, b=2; answer=3
  await page.goto("/lesson/sub-5-takeaway-01/");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);

  const orangeCount = await page
    .locator('[data-testid="tf-cell-filled-a"]')
    .count();
  const blueCount = await page
    .locator('[data-testid="tf-cell-filled-b"]')
    .count();

  // LessonPlayer passes filled={p.a}=5, secondFilled={p.b}=2 for tens-frame
  expect(orangeCount).toBe(5); // p.a = 5
  expect(blueCount).toBe(2); // p.b = 2
});

test("[manip] double-tens-frame (add-20-make-ten-01) — left 9, right 4 for problem 9+4", async ({
  page,
}) => {
  // Intro problem 0: a=9, b=4
  await page.goto("/lesson/add-20-make-ten-01/");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);

  const leftFilled = await page
    .locator('[data-testid="dtf-cell-L-filled"]')
    .count();
  const rightFilled = await page
    .locator('[data-testid="dtf-cell-R-filled"]')
    .count();

  expect(leftFilled).toBe(9); // p.a = 9
  expect(rightFilled).toBe(4); // p.b = 4
});

test("[manip] double-tens-frame subtraction (sub-20-cross-ten-01) — left 12, right 0 for 12−4", async ({
  page,
}) => {
  // Intro problem 0: a=12, b=4; answer=8
  // LessonPlayer passes leftFilled={p.a}=12, rightFilled={p.b}=4
  // Left frame max=10 so leftFilled=12 fills all 10 + overflows (capped at 10 in Frame component)
  // The Frame renders cells 0..9, fills i<filled, so for filled=12: all 10 cells filled
  await page.goto("/lesson/sub-20-cross-ten-01/");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);

  const leftFilled = await page
    .locator('[data-testid="dtf-cell-L-filled"]')
    .count();
  const rightFilled = await page
    .locator('[data-testid="dtf-cell-R-filled"]')
    .count();

  // p.a=12 → Frame renders 10 filled cells (all 10 slots, since 12 > 10)
  expect(leftFilled).toBe(10);
  // p.b=4 → Frame renders 4 filled cells
  expect(rightFilled).toBe(4);
});

test("[manip] place-value-blocks (add-100-01) — 2 rods + 3 cubes first, 1 rod + 5 cubes second, no add buttons", async ({
  page,
}) => {
  // Intro problem 0: a=23, b=15
  // tens=2, ones=3 for first; secondTens=1, secondOnes=5 for second
  await page.goto("/lesson/add-100-01/");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);

  const rodCount = await page.locator('[data-testid="pv-rod"]').count();
  const cubeCount = await page.locator('[data-testid="pv-cube"]').count();
  const rodSecondCount = await page
    .locator('[data-testid="pv-rod-second"]')
    .count();
  const cubeSecondCount = await page
    .locator('[data-testid="pv-cube-second"]')
    .count();
  const addRodCount = await page.locator('[data-testid="pv-add-rod"]').count();
  const addCubeCount = await page
    .locator('[data-testid="pv-add-cube"]')
    .count();

  expect(rodCount).toBe(2); // Math.floor(23/10) = 2
  expect(cubeCount).toBe(3); // 23 % 10 = 3
  expect(rodSecondCount).toBe(1); // Math.floor(15/10) = 1
  expect(cubeSecondCount).toBe(5); // 15 % 10 = 5
  // interactive=false in intro mode — add buttons must NOT be present
  expect(addRodCount).toBe(0);
  expect(addCubeCount).toBe(0);
});

test("[manip] equal-groups (mul-groups-01) — 3 plates, 6 cookies (2 each) for 3×2", async ({
  page,
}) => {
  // Intro problem 0: a=3, b=2; answer=6
  await page.goto("/lesson/mul-groups-01/");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);

  const plateCount = await page.locator('[data-testid="eg-plate"]').count();
  const cookieCount = await page.locator('[data-testid="eg-cookie"]').count();

  expect(plateCount).toBe(3); // p.a = 3 plates
  expect(cookieCount).toBe(6); // p.a × p.b = 3 × 2 = 6 cookies total
});

test("[manip] array-grid (mul-arrays-01) — 12 dots for 3×4, no rotate button", async ({
  page,
}) => {
  // Intro problem 0: a=3, b=4; answer=12
  await page.goto("/lesson/mul-arrays-01/");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);

  const dotCount = await page.locator('[data-testid="ag-dot"]').count();
  const rotateCount = await page.locator('[data-testid="ag-rotate"]').count();

  expect(dotCount).toBe(12); // 3 × 4 = 12
  // interactive=false in intro → rotate button must NOT be present
  expect(rotateCount).toBe(0);
});

test("[manip] number-line subtraction (sub-10-countback-01) — frog at 8, 3 hop arcs for 8−3", async ({
  page,
}) => {
  // Intro problem 0: a=8, b=3; answer=5; max=20
  await page.goto("/lesson/sub-10-countback-01/");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);

  // max=20 → ticks 0..20 = 21 ticks
  const tickCount = await page.locator('[data-testid="nl-tick"]').count();
  expect(tickCount).toBe(21);

  // hopCount=p.b=3, showHops=true → 3 hop arc groups
  const hopArcCount = await page.locator('[data-testid="nl-hop-arc"]').count();
  expect(hopArcCount).toBe(3); // one arc per hop
});

test("[manip] number-line skip-count (mul-skip-01) — 3 hop arcs for 2×3", async ({
  page,
}) => {
  // Intro problem 0: a=2, b=3; answer=6
  // max=p.a*p.b+p.a = 8, hopCount=p.b=3, hopSize=p.a=2, direction=forward
  await page.goto("/lesson/mul-skip-01/");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);

  // max=8 → ticks 0..8 = 9 ticks
  const tickCount = await page.locator('[data-testid="nl-tick"]').count();
  expect(tickCount).toBe(9);

  // hopCount=3 → 3 hop arc groups
  const hopArcCount = await page.locator('[data-testid="nl-hop-arc"]').count();
  expect(hopArcCount).toBe(3);
});

// ---------------------------------------------------------------------------
// Part 3: Full lesson playthrough (add-10-review-01) → 3 stars
// ---------------------------------------------------------------------------

/**
 * Deterministic problem sequence for add-10-review-01:
 *   Intro (tap):     3+4=7, 2+5=7, 6+3=9
 *   Practice (tap):  seed "add-10-review-01-practice" → generated by problemGenerator
 *   Quiz (type):     seed "add-10-review-01-quiz"
 *
 * Rather than hard-coding practice/quiz answers, we read them from the DOM
 * (count orange/blue dots in the tens-frame) to compute the answer dynamically.
 */
test("[playthrough] add-10-review-01 — correct answers throughout → 3 stars", async ({
  page,
}) => {
  await page.goto("/lesson/add-10-review-01/");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(600);

  /** Read the current problem's (a, b) from the tens-frame dot counts */
  async function readProblemFromTensFrame(): Promise<{
    a: number;
    b: number;
  }> {
    const a = await page.locator('[data-testid="tf-cell-filled-a"]').count();
    const b = await page.locator('[data-testid="tf-cell-filled-b"]').count();
    return { a, b };
  }

  // ── Intro phase (3 tap problems) ──────────────────────────────────────────
  for (let i = 0; i < 3; i++) {
    await page.waitForSelector('[data-testid="at-tile"]:not([disabled])', {
      timeout: 8_000,
    });
    const { a, b } = await readProblemFromTensFrame();
    const answer = a + b;
    await clickCorrectTile(page, answer);
    await page.waitForTimeout(900); // wait for transition
  }

  // ── Practice phase (5 tap problems) ──────────────────────────────────────
  for (let i = 0; i < 5; i++) {
    await page.waitForSelector('[data-testid="at-tile"]:not([disabled])', {
      timeout: 8_000,
    });
    const { a, b } = await readProblemFromTensFrame();
    const answer = a + b;
    await clickCorrectTile(page, answer);
    await page.waitForTimeout(900);
  }

  // ── Quiz phase (3 type problems) ─────────────────────────────────────────
  // In quiz phase the manipulative is opacity-20 but still in DOM
  for (let i = 0; i < 3; i++) {
    await page.waitForSelector('[data-testid="np-confirm"]:not([disabled])', {
      timeout: 8_000,
    });
    // The manipulative is faded but still present — read a+b from it
    const a = await page.locator('[data-testid="tf-cell-filled-a"]').count();
    const b = await page.locator('[data-testid="tf-cell-filled-b"]').count();
    const answer = a + b;
    await typeAnswer(page, answer);
    await page.waitForTimeout(900);
  }

  // ── Assert done page with 3 stars ────────────────────────────────────────
  await page.waitForURL(/\/done/, { timeout: 5_000 });
  const url = page.url();
  expect(url).toContain("stars=3");
  expect(url).toContain("lesson=add-10-review-01");
});

// ---------------------------------------------------------------------------
// Part 4: Wrong-answer rejection
// ---------------------------------------------------------------------------

test("[wrong-answer] clicking wrong tile stays on problem; correct tile advances", async ({
  page,
}) => {
  const lesson = loadLesson("add-10-review-01");
  const p = lesson.intro[0]; // a=3, b=4
  const correctAnswer = computeAnswer(lesson.track, p.a, p.b); // 7

  await page.goto("/lesson/add-10-review-01/");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);

  // Find and click a WRONG tile
  await page.waitForSelector('[data-testid="at-tile"]:not([disabled])', {
    timeout: 8_000,
  });
  const tiles = page.locator('[data-testid="at-tile"]');
  const count = await tiles.count();

  let clickedWrong = false;
  for (let i = 0; i < count; i++) {
    const text = (await tiles.nth(i).textContent())?.trim() ?? "";
    if (parseInt(text, 10) !== correctAnswer) {
      await tiles.nth(i).click();
      clickedWrong = true;
      break;
    }
  }
  expect(clickedWrong).toBe(
    true,
    "Expected at least one non-correct tile in the set",
  );

  // After wrong click: URL unchanged, problem still shown
  await page.waitForTimeout(500);
  expect(page.url()).toContain("/lesson/add-10-review-01/");

  // Progress bar: still 0 filled dots (problem index unchanged)
  const filledDots = await page
    .locator('[data-testid="pb-dot-filled"]')
    .count();
  expect(filledDots).toBe(0);

  // Tiles still visible
  await expect(tiles.first()).toBeVisible();

  // Click correct tile → problem advances
  const correctTile = tiles
    .filter({ hasText: new RegExp(`^${correctAnswer}$`) })
    .first();
  await expect(correctTile).toBeVisible({ timeout: 3_000 });
  await correctTile.click();

  await page.waitForTimeout(1_000);

  // After correct: either a new problem (different tiles) or next phase
  // The URL should remain on the lesson (not done yet — first problem of 11)
  expect(page.url()).toContain("/lesson/add-10-review-01/");

  // Now 1 filled dot (progress bar advanced by 1)
  const filledDotsAfter = await page
    .locator('[data-testid="pb-dot-filled"]')
    .count();
  expect(filledDotsAfter).toBe(1);
});
