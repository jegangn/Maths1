# Math Tutor App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js PWA math tutor for one 5-year-old on a Galaxy Tab S8+, following Synthesis Tutor's pedagogy (CPA progression, mastery gating, mascot guide, manipulatives) for addition/subtraction/multiplication.

**Architecture:** Next.js 15 static export + TypeScript + Tailwind + Framer Motion + Zustand + Howler + localStorage. Engine layer is pure TS (testable), UI layer is React components with Framer Motion animations. Lessons are declarative JSON. PWA manifest + service worker for offline tablet install.

**Tech Stack:** Next.js 15, TypeScript (strict), Tailwind CSS, Framer Motion, Zustand, Howler.js, Vitest + Testing Library, bun.

**Spec:** [docs/superpowers/specs/2026-05-18-math-tutor-app-design.md](../specs/2026-05-18-math-tutor-app-design.md)

---

## Phase 1 — Project skeleton

### Task 1: Initialise Next.js project with bun

**Files:**

- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `tailwind.config.ts`, `postcss.config.mjs`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`

- [ ] **Step 1: Run the Next.js initialiser**

```bash
cd C:/dev/projects/math-tutor-app
bun create next-app . --typescript --tailwind --app --no-eslint --no-src-dir --import-alias "@/*"
```

When prompted about overwriting existing files (the `docs/` folder), say no — keep existing.

- [ ] **Step 2: Verify the dev server starts**

```bash
bun run dev
```

Expected: server starts on http://localhost:3000, default Next.js page loads.

- [ ] **Step 3: Stop the dev server (Ctrl+C) and commit**

```bash
git init
git add -A
git commit -m "chore: scaffold Next.js + Tailwind project"
```

---

### Task 2: Install runtime and dev dependencies

**Files:**

- Modify: `package.json`

- [ ] **Step 1: Install runtime deps**

```bash
bun add zustand framer-motion howler
bun add -D @types/howler
```

- [ ] **Step 2: Install test deps**

```bash
bun add -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react
```

- [ ] **Step 3: Commit**

```bash
git add package.json bun.lockb
git commit -m "chore: add runtime + test dependencies"
```

---

### Task 3: Configure Next.js for static export + Vitest

**Files:**

- Modify: `next.config.mjs`
- Create: `vitest.config.ts`, `vitest.setup.ts`

- [ ] **Step 1: Configure static export in `next.config.mjs`**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
```

- [ ] **Step 2: Create `vitest.config.ts`**

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
```

- [ ] **Step 3: Create `vitest.setup.ts`**

```typescript
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 4: Add test scripts to `package.json`**

In `package.json` scripts section:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Run vitest to confirm zero tests pass**

```bash
bun run test
```

Expected: "No test files found" or exit 0 with 0 tests.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: configure static export + Vitest"
```

---

### Task 4: Set up base layout (landscape lock, viewport)

**Files:**

- Modify: `app/layout.tsx`, `app/globals.css`

- [ ] **Step 1: Replace `app/layout.tsx`**

```tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Riko's Math",
  description: "A calm maths tutor for young children",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-cream text-ink h-screen overflow-hidden select-none">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Replace `app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --cream: #faf1e1;
    --ink: #2d2a26;
    --orange: #e8923c;
    --yellow: #f4c95d;
    --blue: #7fb3d5;
    --coral: #e8836a;
  }
  html,
  body {
    height: 100%;
    touch-action: manipulation;
  }
  body {
    font-family:
      system-ui,
      -apple-system,
      sans-serif;
  }
}
```

- [ ] **Step 3: Extend Tailwind theme in `tailwind.config.ts`**

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "var(--cream)",
        ink: "var(--ink)",
        orange: "var(--orange)",
        yellow: "var(--yellow)",
        blue: "var(--blue)",
        coral: "var(--coral)",
      },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 4: Verify dev server renders**

```bash
bun run dev
```

Expected: cream background, empty page, no console errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: base layout with landscape viewport and palette"
```

---

## Phase 2 — Types and storage

### Task 5: Define core TypeScript types

**Files:**

- Create: `lib/types.ts`

- [ ] **Step 1: Write the types file**

```typescript
export type Track = "addition" | "subtraction" | "multiplication";
export type ManipulativeKind =
  | "tens-frame"
  | "double-tens-frame"
  | "place-value-blocks"
  | "equal-groups"
  | "array-grid"
  | "number-line"
  | "number-bond";

export type ProblemType =
  | "add"
  | "subtract"
  | "missing-addend"
  | "make-ten"
  | "equal-groups"
  | "array"
  | "skip-count";

export interface ProblemTemplate {
  type: ProblemType;
  aRange?: [number, number];
  bRange?: [number, number];
  constraint?: string;
  count: number;
  showHint?: boolean | string;
}

export interface IntroProblem {
  a: number;
  b: number;
  showHint?: string;
}

export interface Lesson {
  id: string;
  track: Track;
  title: string;
  skill: string;
  manipulative: ManipulativeKind;
  intro: IntroProblem[];
  practiceTemplate: ProblemTemplate;
  quizTemplate: ProblemTemplate;
  prerequisites: string[];
  unlocks: string[];
}

export interface Problem {
  id: string;
  a: number;
  b: number;
  answer: number;
  inputMode: "tap" | "type";
  distractors?: number[];
  showHint?: string;
}

export type PhaseKind = "intro" | "practice" | "quiz";

export interface LessonAttemptResult {
  lessonId: string;
  practiceFirstTryCorrect: number;
  practiceTotal: number;
  quizFirstTryCorrect: number;
  quizTotal: number;
  startedAt: string;
  completedAt: string;
}

export interface LessonProgress {
  stars: 0 | 1 | 2 | 3;
  firstTryAccuracy: number;
  attempts: number;
  completedAt: string;
}

export interface SkillMastery {
  successes: number;
  attempts: number;
  lastSeen: string;
}

export interface SessionEntry {
  date: string;
  minutesSpent: number;
  lessonsCompleted: number;
}

export interface ProgressBlob {
  version: 1;
  profile: { name: string; createdAt: string };
  currentLessonId: string;
  lessons: Record<string, LessonProgress>;
  skillMastery: Record<string, SkillMastery>;
  sessionHistory: SessionEntry[];
  failedAttemptCounts: Record<string, number>;
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/types.ts
git commit -m "feat: core TypeScript types"
```

---

### Task 6: Storage module with versioning (TDD)

**Files:**

- Create: `engine/storage.ts`, `engine/storage.test.ts`

- [ ] **Step 1: Write failing test `engine/storage.test.ts`**

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import {
  loadProgress,
  saveProgress,
  resetProgress,
  STORAGE_KEY,
} from "./storage";
import type { ProgressBlob } from "@/lib/types";

describe("storage", () => {
  beforeEach(() => localStorage.clear());

  it("returns a default blob when nothing is stored", () => {
    const blob = loadProgress();
    expect(blob.version).toBe(1);
    expect(blob.currentLessonId).toBe("add-10-review-01");
    expect(blob.lessons).toEqual({});
  });

  it("round-trips a blob through save and load", () => {
    const initial = loadProgress();
    initial.lessons["add-10-review-01"] = {
      stars: 3,
      firstTryAccuracy: 1,
      attempts: 1,
      completedAt: "2026-05-18T10:00:00Z",
    };
    saveProgress(initial);
    const loaded = loadProgress();
    expect(loaded.lessons["add-10-review-01"]?.stars).toBe(3);
  });

  it("reset clears storage", () => {
    saveProgress({ ...loadProgress(), currentLessonId: "changed" });
    resetProgress();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("returns default when stored blob is corrupt", () => {
    localStorage.setItem(STORAGE_KEY, "{not json");
    const blob = loadProgress();
    expect(blob.version).toBe(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
bun run test engine/storage.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement `engine/storage.ts`**

```typescript
import type { ProgressBlob } from "@/lib/types";

export const STORAGE_KEY = "mathTutor.v1";

const defaultBlob: ProgressBlob = {
  version: 1,
  profile: { name: "Child", createdAt: new Date().toISOString() },
  currentLessonId: "add-10-review-01",
  lessons: {},
  skillMastery: {},
  sessionHistory: [],
  failedAttemptCounts: {},
};

export function loadProgress(): ProgressBlob {
  if (typeof window === "undefined") return { ...defaultBlob };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultBlob };
    const parsed = JSON.parse(raw) as ProgressBlob;
    if (parsed.version !== 1) return { ...defaultBlob };
    return parsed;
  } catch {
    return { ...defaultBlob };
  }
}

export function saveProgress(blob: ProgressBlob): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(blob));
}

export function resetProgress(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
bun run test engine/storage.test.ts
```

Expected: PASS — 4 tests.

- [ ] **Step 5: Commit**

```bash
git add engine/storage.ts engine/storage.test.ts
git commit -m "feat: localStorage progress persistence with default + corruption fallback"
```

---

### Task 7: Zustand store for in-session state

**Files:**

- Create: `engine/store.ts`

- [ ] **Step 1: Implement the store**

```typescript
import { create } from "zustand";
import type { ProgressBlob, Problem, PhaseKind } from "@/lib/types";
import { loadProgress, saveProgress } from "./storage";

interface AppState {
  progress: ProgressBlob;
  currentProblem: Problem | null;
  phase: PhaseKind;
  phaseIndex: number;
  wrongCount: number;
  hydrate: () => void;
  setProblem: (p: Problem | null, phase: PhaseKind, index: number) => void;
  recordWrong: () => void;
  recordCorrect: () => void;
  commitProgress: (blob: ProgressBlob) => void;
}

export const useAppStore = create<AppState>((set) => ({
  progress: loadProgress(),
  currentProblem: null,
  phase: "intro",
  phaseIndex: 0,
  wrongCount: 0,
  hydrate: () => set({ progress: loadProgress() }),
  setProblem: (p, phase, index) =>
    set({ currentProblem: p, phase, phaseIndex: index, wrongCount: 0 }),
  recordWrong: () => set((s) => ({ wrongCount: s.wrongCount + 1 })),
  recordCorrect: () => set({ wrongCount: 0 }),
  commitProgress: (blob) => {
    saveProgress(blob);
    set({ progress: blob });
  },
}));
```

- [ ] **Step 2: Commit**

```bash
git add engine/store.ts
git commit -m "feat: Zustand store for in-session state"
```

---

## Phase 3 — Engine logic (TDD)

### Task 8: Problem generator

**Files:**

- Create: `engine/problemGenerator.ts`, `engine/problemGenerator.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
import { describe, it, expect } from "vitest";
import { generateProblems } from "./problemGenerator";
import type { ProblemTemplate } from "@/lib/types";

describe("generateProblems", () => {
  it('generates the right count of "add" problems', () => {
    const t: ProblemTemplate = {
      type: "add",
      aRange: [1, 5],
      bRange: [1, 5],
      count: 10,
    };
    const problems = generateProblems(t, "seed-1");
    expect(problems.length).toBe(10);
    for (const p of problems) {
      expect(p.answer).toBe(p.a + p.b);
      expect(p.a).toBeGreaterThanOrEqual(1);
      expect(p.a).toBeLessThanOrEqual(5);
    }
  });

  it("respects sum > 10 constraint for make-ten problems", () => {
    const t: ProblemTemplate = {
      type: "make-ten",
      aRange: [6, 9],
      bRange: [3, 7],
      constraint: "sum > 10",
      count: 20,
    };
    const problems = generateProblems(t, "seed-2");
    for (const p of problems) expect(p.a + p.b).toBeGreaterThan(10);
  });

  it("is deterministic for the same seed", () => {
    const t: ProblemTemplate = {
      type: "add",
      aRange: [1, 9],
      bRange: [1, 9],
      count: 5,
    };
    const a = generateProblems(t, "seed-3");
    const b = generateProblems(t, "seed-3");
    expect(a).toEqual(b);
  });

  it("generates subtract problems with non-negative answers", () => {
    const t: ProblemTemplate = {
      type: "subtract",
      aRange: [1, 10],
      bRange: [1, 10],
      count: 20,
    };
    const problems = generateProblems(t, "seed-4");
    for (const p of problems) {
      expect(p.answer).toBe(p.a - p.b);
      expect(p.answer).toBeGreaterThanOrEqual(0);
    }
  });
});
```

- [ ] **Step 2: Run to verify failure**

```bash
bun run test engine/problemGenerator.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement `engine/problemGenerator.ts`**

```typescript
import type { Problem, ProblemTemplate } from "@/lib/types";

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function stringHash(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function randInt(rng: () => number, lo: number, hi: number): number {
  return lo + Math.floor(rng() * (hi - lo + 1));
}

export function generateProblems(
  template: ProblemTemplate,
  seed: string,
): Problem[] {
  const rng = mulberry32(stringHash(seed));
  const out: Problem[] = [];
  let attempts = 0;
  while (out.length < template.count && attempts < template.count * 50) {
    attempts++;
    const a = randInt(
      rng,
      template.aRange?.[0] ?? 0,
      template.aRange?.[1] ?? 9,
    );
    const b = randInt(
      rng,
      template.bRange?.[0] ?? 0,
      template.bRange?.[1] ?? 9,
    );
    let answer: number;
    switch (template.type) {
      case "add":
      case "make-ten":
        answer = a + b;
        break;
      case "subtract":
        answer = a - b;
        if (answer < 0) continue;
        break;
      case "missing-addend":
        answer = a - b;
        if (answer < 0) continue;
        break;
      case "equal-groups":
      case "array":
        answer = a * b;
        break;
      case "skip-count":
        answer = a * b;
        break;
    }
    if (template.constraint === "sum > 10" && a + b <= 10) continue;
    if (template.constraint === "sum <= 10" && a + b > 10) continue;
    out.push({
      id: `p-${out.length}`,
      a,
      b,
      answer,
      inputMode: "tap",
      showHint:
        typeof template.showHint === "string" ? template.showHint : undefined,
    });
  }
  return out;
}
```

- [ ] **Step 4: Run to verify pass**

```bash
bun run test engine/problemGenerator.test.ts
```

Expected: PASS — 4 tests.

- [ ] **Step 5: Commit**

```bash
git add engine/problemGenerator.ts engine/problemGenerator.test.ts
git commit -m "feat: deterministic problem generator with constraints"
```

---

### Task 9: Distractor generator for tap problems

**Files:**

- Create: `engine/distractors.ts`, `engine/distractors.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
import { describe, it, expect } from "vitest";
import { generateDistractors } from "./distractors";

describe("generateDistractors", () => {
  it("returns two unique distractors close to the answer", () => {
    const d = generateDistractors(13, "seed-1");
    expect(d.length).toBe(2);
    expect(new Set(d).size).toBe(2);
    expect(d).not.toContain(13);
    for (const x of d) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(Math.abs(x - 13)).toBeLessThanOrEqual(5);
    }
  });

  it("does not return negative numbers for small answers", () => {
    const d = generateDistractors(2, "seed-2");
    for (const x of d) expect(x).toBeGreaterThanOrEqual(0);
  });

  it("is deterministic", () => {
    expect(generateDistractors(7, "s")).toEqual(generateDistractors(7, "s"));
  });
});
```

- [ ] **Step 2: Run to verify failure**

```bash
bun run test engine/distractors.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement `engine/distractors.ts`**

```typescript
function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function stringHash(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function generateDistractors(answer: number, seed: string): number[] {
  const rng = mulberry32(stringHash(seed));
  const candidates = new Set<number>();
  const offsets = [-1, 1, -2, 2, -3, 3, -4, 4, -5, 5];
  while (candidates.size < 2) {
    const offset = offsets[Math.floor(rng() * offsets.length)];
    const val = answer + offset;
    if (val >= 0 && val !== answer) candidates.add(val);
  }
  return Array.from(candidates).slice(0, 2);
}
```

- [ ] **Step 4: Run to verify pass**

```bash
bun run test engine/distractors.test.ts
```

Expected: PASS — 3 tests.

- [ ] **Step 5: Commit**

```bash
git add engine/distractors.ts engine/distractors.test.ts
git commit -m "feat: plausible distractor generation for tap problems"
```

---

### Task 10: Mastery tracker

**Files:**

- Create: `engine/masteryTracker.ts`, `engine/masteryTracker.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
import { describe, it, expect } from "vitest";
import { evaluateLessonAttempt, didPass, computeStars } from "./masteryTracker";

describe("evaluateLessonAttempt", () => {
  it("passes when 4/5 practice and 2/3 quiz correct on first try", () => {
    const result = {
      practiceFirstTryCorrect: 4,
      practiceTotal: 5,
      quizFirstTryCorrect: 2,
      quizTotal: 3,
    };
    expect(didPass(result)).toBe(true);
  });

  it("fails when practice below threshold", () => {
    const result = {
      practiceFirstTryCorrect: 3,
      practiceTotal: 5,
      quizFirstTryCorrect: 3,
      quizTotal: 3,
    };
    expect(didPass(result)).toBe(false);
  });

  it("awards 3 stars when all 8 first-try correct", () => {
    const result = {
      practiceFirstTryCorrect: 5,
      practiceTotal: 5,
      quizFirstTryCorrect: 3,
      quizTotal: 3,
    };
    expect(computeStars(result, false)).toBe(3);
  });

  it("awards 2 stars when passed but with mistakes", () => {
    const result = {
      practiceFirstTryCorrect: 4,
      practiceTotal: 5,
      quizFirstTryCorrect: 3,
      quizTotal: 3,
    };
    expect(computeStars(result, false)).toBe(2);
  });

  it("awards 1 star when triggered stuck-hint at least once", () => {
    const result = {
      practiceFirstTryCorrect: 4,
      practiceTotal: 5,
      quizFirstTryCorrect: 2,
      quizTotal: 3,
    };
    expect(computeStars(result, true)).toBe(1);
  });
});
```

- [ ] **Step 2: Run to verify failure**

```bash
bun run test engine/masteryTracker.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement `engine/masteryTracker.ts`**

```typescript
import type { LessonAttemptResult } from "@/lib/types";

type Outcome = Pick<
  LessonAttemptResult,
  | "practiceFirstTryCorrect"
  | "practiceTotal"
  | "quizFirstTryCorrect"
  | "quizTotal"
>;

export function didPass(r: Outcome): boolean {
  return r.practiceFirstTryCorrect >= 4 && r.quizFirstTryCorrect >= 2;
}

export function computeStars(
  r: Outcome,
  triggeredStuckHint: boolean,
): 0 | 1 | 2 | 3 {
  if (!didPass(r) && !triggeredStuckHint) return 0;
  if (triggeredStuckHint) return 1;
  const allFirstTry =
    r.practiceFirstTryCorrect === r.practiceTotal &&
    r.quizFirstTryCorrect === r.quizTotal;
  if (allFirstTry) return 3;
  return 2;
}

export function evaluateLessonAttempt(r: Outcome, triggeredStuckHint: boolean) {
  return { passed: didPass(r), stars: computeStars(r, triggeredStuckHint) };
}
```

- [ ] **Step 4: Run to verify pass**

```bash
bun run test engine/masteryTracker.test.ts
```

Expected: PASS — 5 tests.

- [ ] **Step 5: Commit**

```bash
git add engine/masteryTracker.ts engine/masteryTracker.test.ts
git commit -m "feat: mastery gate + star computation"
```

---

### Task 11: Lesson router

**Files:**

- Create: `engine/lessonRouter.ts`, `engine/lessonRouter.test.ts`, `lessons/index.ts`

- [ ] **Step 1: Write `lessons/index.ts` placeholder (real lessons added in Task 31)**

```typescript
import type { Lesson } from "@/lib/types";
import addReview01 from "./add-10-review-01.json";

export const allLessons: Record<string, Lesson> = {
  "add-10-review-01": addReview01 as Lesson,
};

export function getLesson(id: string): Lesson | undefined {
  return allLessons[id];
}
```

- [ ] **Step 2: Create a minimal `lessons/add-10-review-01.json`** so the import resolves:

```json
{
  "id": "add-10-review-01",
  "track": "addition",
  "title": "Adding within 10 — warm up",
  "skill": "add-within-10-review",
  "manipulative": "tens-frame",
  "intro": [
    { "a": 3, "b": 4 },
    { "a": 2, "b": 5 },
    { "a": 6, "b": 3 }
  ],
  "practiceTemplate": {
    "type": "add",
    "aRange": [2, 7],
    "bRange": [2, 7],
    "constraint": "sum <= 10",
    "count": 5
  },
  "quizTemplate": {
    "type": "add",
    "aRange": [2, 7],
    "bRange": [2, 7],
    "constraint": "sum <= 10",
    "count": 3,
    "showHint": false
  },
  "prerequisites": [],
  "unlocks": ["add-10-bonds-01"]
}
```

- [ ] **Step 3: Write failing test `engine/lessonRouter.test.ts`**

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { decideNextLesson } from "./lessonRouter";
import type { ProgressBlob } from "@/lib/types";

const blankProgress: ProgressBlob = {
  version: 1,
  profile: { name: "Test", createdAt: "2026-05-18" },
  currentLessonId: "add-10-review-01",
  lessons: {},
  skillMastery: {},
  sessionHistory: [],
  failedAttemptCounts: {},
};

describe("decideNextLesson", () => {
  beforeEach(() => localStorage.clear());

  it("returns current lesson when no progress", () => {
    expect(decideNextLesson(blankProgress)).toBe("add-10-review-01");
  });

  it("returns the unlocks target after passing the current lesson", () => {
    const p = {
      ...blankProgress,
      lessons: {
        "add-10-review-01": {
          stars: 3 as const,
          firstTryAccuracy: 1,
          attempts: 1,
          completedAt: "2026-05-18T10:00:00Z",
        },
      },
    };
    expect(decideNextLesson(p)).toBe("add-10-bonds-01");
  });

  it("routes to prerequisite after 3 failed attempts on a lesson with prereqs", () => {
    const p = {
      ...blankProgress,
      currentLessonId: "add-10-bonds-01",
      failedAttemptCounts: { "add-10-bonds-01": 3 },
    };
    expect(decideNextLesson(p)).toBe("add-10-review-01");
  });
});
```

- [ ] **Step 4: Run to verify failure**

```bash
bun run test engine/lessonRouter.test.ts
```

Expected: FAIL.

- [ ] **Step 5: Implement `engine/lessonRouter.ts`**

```typescript
import type { ProgressBlob } from "@/lib/types";
import { getLesson } from "@/lessons";

export function decideNextLesson(progress: ProgressBlob): string {
  const currentId = progress.currentLessonId;
  const currentLesson = getLesson(currentId);
  if (!currentLesson) return currentId;

  const failedCount = progress.failedAttemptCounts[currentId] ?? 0;
  if (failedCount >= 3 && currentLesson.prerequisites.length > 0) {
    return currentLesson.prerequisites[0];
  }

  const completedRecord = progress.lessons[currentId];
  if (
    completedRecord &&
    completedRecord.stars > 0 &&
    currentLesson.unlocks.length > 0
  ) {
    return currentLesson.unlocks[0];
  }

  return currentId;
}
```

- [ ] **Step 6: Run to verify pass**

```bash
bun run test engine/lessonRouter.test.ts
```

Expected: PASS — 3 tests.

- [ ] **Step 7: Configure `tsconfig.json` for JSON imports**

In `tsconfig.json` compilerOptions, ensure `"resolveJsonModule": true` is set (Next.js sets it by default; verify).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: lesson router with mastery + remediation routing"
```

---

## Phase 4 — Sound

### Task 12: Sound module

**Files:**

- Create: `lib/sound.ts`, `public/sounds/` (directory only)

- [ ] **Step 1: Implement `lib/sound.ts`** (sources fetched in Task 35)

```typescript
import { Howl } from "howler";

type SoundName = "correct" | "wrong" | "win" | "drop" | "tap";

const sounds: Partial<Record<SoundName, Howl>> = {};

function get(name: SoundName): Howl {
  if (!sounds[name]) {
    sounds[name] = new Howl({
      src: [`/sounds/${name}.mp3`],
      volume: name === "win" ? 0.7 : 0.5,
      preload: true,
    });
  }
  return sounds[name]!;
}

export function play(name: SoundName) {
  if (typeof window === "undefined") return;
  get(name).play();
}
```

- [ ] **Step 2: Commit**

```bash
mkdir -p public/sounds
git add lib/sound.ts public/sounds
git commit -m "feat: sound module wrapper around Howler"
```

---

## Phase 5 — Manipulatives

### Task 13: TensFrame component

**Files:**

- Create: `components/manipulatives/TensFrame.tsx`, `components/manipulatives/TensFrame.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TensFrame } from "./TensFrame";

describe("TensFrame", () => {
  it("renders 10 empty cells", () => {
    render(<TensFrame filled={0} onChange={() => {}} mode="fill" />);
    expect(screen.getAllByTestId("tf-cell").length).toBe(10);
  });

  it("renders n filled cells when filled=n", () => {
    render(<TensFrame filled={4} onChange={() => {}} mode="fill" />);
    expect(screen.getAllByTestId("tf-cell-filled").length).toBe(4);
  });

  it("calls onChange when a tray dot is tapped (fill mode)", () => {
    const onChange = vi.fn();
    render(<TensFrame filled={2} onChange={onChange} mode="fill" />);
    fireEvent.click(screen.getByTestId("tf-tray-dot"));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("calls onChange when a filled cell is tapped (take-away mode)", () => {
    const onChange = vi.fn();
    render(<TensFrame filled={5} onChange={onChange} mode="take-away" />);
    fireEvent.click(screen.getAllByTestId("tf-cell-filled")[0]);
    expect(onChange).toHaveBeenCalledWith(4);
  });
});
```

- [ ] **Step 2: Run to verify failure**

```bash
bun run test components/manipulatives/TensFrame.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement `components/manipulatives/TensFrame.tsx`**

```tsx
"use client";
import { motion } from "framer-motion";
import { play } from "@/lib/sound";

interface Props {
  filled: number;
  onChange: (next: number) => void;
  mode: "fill" | "take-away";
  highlightTo10?: boolean;
}

export function TensFrame({ filled, onChange, mode, highlightTo10 }: Props) {
  const cells = Array.from({ length: 10 }, (_, i) => i < filled);
  const handleTrayClick = () => {
    if (mode !== "fill" || filled >= 10) return;
    play("drop");
    onChange(filled + 1);
  };
  const handleCellClick = (i: number) => {
    if (mode !== "take-away" || !cells[i]) return;
    play("drop");
    onChange(filled - 1);
  };
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="grid grid-cols-5 gap-2 p-3 bg-white rounded-2xl border-4 border-ink/80">
        {cells.map((on, i) => {
          const isHintCell = highlightTo10 && !on && i < 10;
          return (
            <button
              key={i}
              data-testid={on ? "tf-cell-filled" : "tf-cell"}
              onClick={() => handleCellClick(i)}
              className={`w-16 h-16 rounded-xl flex items-center justify-center ${isHintCell ? "bg-yellow/30" : "bg-cream"}`}
              style={{ outline: "2px solid var(--ink)" }}
            >
              {on && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  className="w-10 h-10 rounded-full bg-orange"
                />
              )}
            </button>
          );
        })}
      </div>
      {mode === "fill" && (
        <button
          data-testid="tf-tray-dot"
          onClick={handleTrayClick}
          className="w-16 h-16 rounded-full bg-orange border-4 border-ink/80 active:scale-95 transition-transform"
        />
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run to verify pass**

```bash
bun run test components/manipulatives/TensFrame.test.tsx
```

Expected: PASS — 4 tests.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: TensFrame manipulative with fill/take-away modes"
```

---

### Task 14: DoubleTensFrame component

**Files:**

- Create: `components/manipulatives/DoubleTensFrame.tsx`, `components/manipulatives/DoubleTensFrame.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DoubleTensFrame } from "./DoubleTensFrame";

describe("DoubleTensFrame", () => {
  it("renders 20 cells total", () => {
    render(<DoubleTensFrame leftFilled={0} rightFilled={0} onAdd={() => {}} />);
    expect(screen.getAllByTestId(/dtf-cell/).length).toBe(20);
  });

  it("first 10 dots fill the left frame, then spill into right", () => {
    const onAdd = vi.fn();
    const { rerender } = render(
      <DoubleTensFrame leftFilled={9} rightFilled={0} onAdd={onAdd} />,
    );
    fireEvent.click(screen.getByTestId("dtf-tray-dot"));
    expect(onAdd).toHaveBeenCalledWith({ left: 10, right: 0 });
    rerender(<DoubleTensFrame leftFilled={10} rightFilled={0} onAdd={onAdd} />);
    fireEvent.click(screen.getByTestId("dtf-tray-dot"));
    expect(onAdd).toHaveBeenLastCalledWith({ left: 10, right: 1 });
  });
});
```

- [ ] **Step 2: Run to verify failure**

```bash
bun run test components/manipulatives/DoubleTensFrame.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement `components/manipulatives/DoubleTensFrame.tsx`**

```tsx
"use client";
import { motion } from "framer-motion";
import { play } from "@/lib/sound";

interface Props {
  leftFilled: number;
  rightFilled: number;
  onAdd: (next: { left: number; right: number }) => void;
}

function Frame({ filled, prefix }: { filled: number; prefix: string }) {
  const cells = Array.from({ length: 10 }, (_, i) => i < filled);
  return (
    <div className="grid grid-cols-5 gap-2 p-3 bg-white rounded-2xl border-4 border-ink/80">
      {cells.map((on, i) => (
        <div
          key={i}
          data-testid={`dtf-cell-${prefix}-${on ? "filled" : "empty"}`}
          className="w-14 h-14 rounded-xl flex items-center justify-center bg-cream"
          style={{ outline: "2px solid var(--ink)" }}
        >
          {on && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              className="w-9 h-9 rounded-full bg-orange"
            />
          )}
        </div>
      ))}
    </div>
  );
}

export function DoubleTensFrame({ leftFilled, rightFilled, onAdd }: Props) {
  const handleAdd = () => {
    play("drop");
    if (leftFilled < 10) onAdd({ left: leftFilled + 1, right: rightFilled });
    else onAdd({ left: leftFilled, right: rightFilled + 1 });
  };
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-6">
        <Frame filled={leftFilled} prefix="L" />
        <Frame filled={rightFilled} prefix="R" />
      </div>
      <button
        data-testid="dtf-tray-dot"
        onClick={handleAdd}
        className="w-16 h-16 rounded-full bg-orange border-4 border-ink/80 active:scale-95 transition-transform"
      />
    </div>
  );
}
```

- [ ] **Step 4: Run to verify pass**

```bash
bun run test components/manipulatives/DoubleTensFrame.test.tsx
```

Expected: PASS — 2 tests.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: DoubleTensFrame manipulative with auto-spill"
```

---

### Task 15: PlaceValueBlocks component

**Files:**

- Create: `components/manipulatives/PlaceValueBlocks.tsx`, `components/manipulatives/PlaceValueBlocks.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PlaceValueBlocks } from "./PlaceValueBlocks";

describe("PlaceValueBlocks", () => {
  it("renders the requested tens and ones", () => {
    render(<PlaceValueBlocks tens={2} ones={4} onChange={() => {}} />);
    expect(screen.getAllByTestId("pv-rod").length).toBe(2);
    expect(screen.getAllByTestId("pv-cube").length).toBe(4);
  });

  it("clicking add-rod increments tens", () => {
    const onChange = vi.fn();
    render(<PlaceValueBlocks tens={1} ones={3} onChange={onChange} />);
    fireEvent.click(screen.getByTestId("pv-add-rod"));
    expect(onChange).toHaveBeenCalledWith({ tens: 2, ones: 3 });
  });

  it("clicking add-cube increments ones", () => {
    const onChange = vi.fn();
    render(<PlaceValueBlocks tens={1} ones={3} onChange={onChange} />);
    fireEvent.click(screen.getByTestId("pv-add-cube"));
    expect(onChange).toHaveBeenCalledWith({ tens: 1, ones: 4 });
  });
});
```

- [ ] **Step 2: Run to verify failure**

```bash
bun run test components/manipulatives/PlaceValueBlocks.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement `components/manipulatives/PlaceValueBlocks.tsx`**

```tsx
"use client";
import { play } from "@/lib/sound";

interface Props {
  tens: number;
  ones: number;
  onChange: (next: { tens: number; ones: number }) => void;
}

export function PlaceValueBlocks({ tens, ones, onChange }: Props) {
  const handleAddRod = () => {
    play("drop");
    onChange({ tens: tens + 1, ones });
  };
  const handleAddCube = () => {
    play("drop");
    onChange({ tens, ones: ones + 1 });
  };
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-4 items-end min-h-[200px]">
        {Array.from({ length: tens }, (_, i) => (
          <div
            key={`r${i}`}
            data-testid="pv-rod"
            className="w-10 h-[180px] bg-blue rounded-md border-2 border-ink/80"
          />
        ))}
        <div className="flex flex-wrap w-32 gap-1 items-end">
          {Array.from({ length: ones }, (_, i) => (
            <div
              key={`c${i}`}
              data-testid="pv-cube"
              className="w-8 h-8 bg-coral rounded-sm border-2 border-ink/80"
            />
          ))}
        </div>
      </div>
      <div className="flex gap-4">
        <button
          data-testid="pv-add-rod"
          onClick={handleAddRod}
          className="px-4 py-3 bg-blue rounded-xl border-2 border-ink/80"
        >
          + Rod (10)
        </button>
        <button
          data-testid="pv-add-cube"
          onClick={handleAddCube}
          className="px-4 py-3 bg-coral rounded-xl border-2 border-ink/80"
        >
          + Cube (1)
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run to verify pass**

```bash
bun run test components/manipulatives/PlaceValueBlocks.test.tsx
```

Expected: PASS — 3 tests.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: PlaceValueBlocks manipulative (tens-rods + ones-cubes)"
```

---

### Task 16: EqualGroups component

**Files:**

- Create: `components/manipulatives/EqualGroups.tsx`, `components/manipulatives/EqualGroups.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EqualGroups } from "./EqualGroups";

describe("EqualGroups", () => {
  it("renders N plates with M cookies each", () => {
    render(
      <EqualGroups
        plates={3}
        perPlate={4}
        countedPlates={0}
        onCount={() => {}}
      />,
    );
    expect(screen.getAllByTestId("eg-plate").length).toBe(3);
    expect(screen.getAllByTestId("eg-cookie").length).toBe(12);
  });

  it("tapping a plate calls onCount", () => {
    const onCount = vi.fn();
    render(
      <EqualGroups
        plates={3}
        perPlate={4}
        countedPlates={0}
        onCount={onCount}
      />,
    );
    fireEvent.click(screen.getAllByTestId("eg-plate")[0]);
    expect(onCount).toHaveBeenCalledWith(1);
  });
});
```

- [ ] **Step 2: Run to verify failure**

```bash
bun run test components/manipulatives/EqualGroups.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement `components/manipulatives/EqualGroups.tsx`**

```tsx
"use client";
import { motion } from "framer-motion";
import { play } from "@/lib/sound";

interface Props {
  plates: number;
  perPlate: number;
  countedPlates: number;
  onCount: (n: number) => void;
}

export function EqualGroups({
  plates,
  perPlate,
  countedPlates,
  onCount,
}: Props) {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-6 items-end">
        {Array.from({ length: plates }, (_, p) => {
          const counted = p < countedPlates;
          return (
            <button
              key={p}
              data-testid="eg-plate"
              onClick={() => {
                play("drop");
                onCount(p + 1);
              }}
              className={`relative w-32 h-32 rounded-full border-4 border-ink/80 flex flex-wrap p-2 gap-1 items-center justify-center ${counted ? "bg-yellow/40" : "bg-cream"}`}
            >
              {Array.from({ length: perPlate }, (_, c) => (
                <motion.div
                  key={c}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: c * 0.05, type: "spring" }}
                  data-testid="eg-cookie"
                  className="w-6 h-6 rounded-full bg-coral border-2 border-ink/60"
                />
              ))}
            </button>
          );
        })}
      </div>
      <div className="text-2xl font-bold">
        Counted: {countedPlates * perPlate}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run to verify pass**

```bash
bun run test components/manipulatives/EqualGroups.test.tsx
```

Expected: PASS — 2 tests.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: EqualGroups manipulative for multiplication"
```

---

### Task 17: ArrayGrid component

**Files:**

- Create: `components/manipulatives/ArrayGrid.tsx`, `components/manipulatives/ArrayGrid.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ArrayGrid } from "./ArrayGrid";

describe("ArrayGrid", () => {
  it("renders rows * cols dots", () => {
    render(<ArrayGrid rows={3} cols={4} rotated={false} onRotate={() => {}} />);
    expect(screen.getAllByTestId("ag-dot").length).toBe(12);
  });

  it("clicking rotate fires onRotate", () => {
    const onRotate = vi.fn();
    render(<ArrayGrid rows={3} cols={4} rotated={false} onRotate={onRotate} />);
    fireEvent.click(screen.getByTestId("ag-rotate"));
    expect(onRotate).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run to verify failure**

```bash
bun run test components/manipulatives/ArrayGrid.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement `components/manipulatives/ArrayGrid.tsx`**

```tsx
"use client";
import { motion } from "framer-motion";

interface Props {
  rows: number;
  cols: number;
  rotated: boolean;
  onRotate: () => void;
}

export function ArrayGrid({ rows, cols, rotated, onRotate }: Props) {
  const r = rotated ? cols : rows;
  const c = rotated ? rows : cols;
  return (
    <div className="flex flex-col items-center gap-6">
      <motion.div
        animate={{ rotate: rotated ? 90 : 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="grid gap-3 p-4 bg-white rounded-2xl border-4 border-ink/80"
        style={{ gridTemplateColumns: `repeat(${c}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: r * c }, (_, i) => (
          <div
            key={i}
            data-testid="ag-dot"
            className="w-10 h-10 rounded-full bg-orange border-2 border-ink/60"
          />
        ))}
      </motion.div>
      <button
        data-testid="ag-rotate"
        onClick={onRotate}
        className="px-5 py-3 bg-blue rounded-xl border-2 border-ink/80"
      >
        Rotate
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Run to verify pass**

```bash
bun run test components/manipulatives/ArrayGrid.test.tsx
```

Expected: PASS — 2 tests.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: ArrayGrid manipulative with commutativity rotation"
```

---

### Task 18: NumberLine component

**Files:**

- Create: `components/manipulatives/NumberLine.tsx`, `components/manipulatives/NumberLine.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NumberLine } from "./NumberLine";

describe("NumberLine", () => {
  it("renders ticks 0..max", () => {
    render(<NumberLine max={10} frogAt={0} onHop={() => {}} />);
    expect(screen.getAllByTestId("nl-tick").length).toBe(11);
  });

  it("clicking hop-right calls onHop with +1", () => {
    const onHop = vi.fn();
    render(<NumberLine max={10} frogAt={3} onHop={onHop} />);
    fireEvent.click(screen.getByTestId("nl-hop-right"));
    expect(onHop).toHaveBeenCalledWith(4);
  });

  it("clicking hop-left calls onHop with -1", () => {
    const onHop = vi.fn();
    render(<NumberLine max={10} frogAt={3} onHop={onHop} />);
    fireEvent.click(screen.getByTestId("nl-hop-left"));
    expect(onHop).toHaveBeenCalledWith(2);
  });
});
```

- [ ] **Step 2: Run to verify failure**

```bash
bun run test components/manipulatives/NumberLine.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement `components/manipulatives/NumberLine.tsx`**

```tsx
"use client";
import { motion } from "framer-motion";
import { play } from "@/lib/sound";

interface Props {
  max: number;
  frogAt: number;
  step?: number;
  onHop: (next: number) => void;
}

export function NumberLine({ max, frogAt, step = 1, onHop }: Props) {
  const ticks = Array.from({ length: max + 1 }, (_, i) => i);
  const tickPercent = (i: number) => (i / max) * 100;
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
      <div className="relative w-full h-24">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-ink/70 -translate-y-1/2" />
        {ticks.map((t) => (
          <div
            key={t}
            data-testid="nl-tick"
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center"
            style={{ left: `${tickPercent(t)}%` }}
          >
            <div className="w-1 h-4 bg-ink/70" />
            <div className="text-sm mt-1">{t}</div>
          </div>
        ))}
        <motion.div
          animate={{ left: `${tickPercent(frogAt)}%` }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          className="absolute top-0 -translate-x-1/2 text-3xl"
        >
          🐸
        </motion.div>
      </div>
      <div className="flex gap-4">
        <button
          data-testid="nl-hop-left"
          onClick={() => {
            play("drop");
            onHop(Math.max(0, frogAt - step));
          }}
          className="px-5 py-3 bg-blue rounded-xl border-2 border-ink/80"
        >
          ← Hop
        </button>
        <button
          data-testid="nl-hop-right"
          onClick={() => {
            play("drop");
            onHop(Math.min(max, frogAt + step));
          }}
          className="px-5 py-3 bg-blue rounded-xl border-2 border-ink/80"
        >
          Hop →
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run to verify pass**

```bash
bun run test components/manipulatives/NumberLine.test.tsx
```

Expected: PASS — 3 tests.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: NumberLine manipulative with hopping frog"
```

---

### Task 19: NumberBond component

**Files:**

- Create: `components/manipulatives/NumberBond.tsx`, `components/manipulatives/NumberBond.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NumberBond } from "./NumberBond";

describe("NumberBond", () => {
  it("renders three circles", () => {
    render(
      <NumberBond whole={null} partA={null} partB={null} onSet={() => {}} />,
    );
    expect(screen.getByTestId("nb-whole")).toBeInTheDocument();
    expect(screen.getByTestId("nb-part-a")).toBeInTheDocument();
    expect(screen.getByTestId("nb-part-b")).toBeInTheDocument();
  });

  it("clicking a circle prompts entry via onSet", () => {
    const onSet = vi.fn();
    render(<NumberBond whole={null} partA={null} partB={null} onSet={onSet} />);
    fireEvent.click(screen.getByTestId("nb-whole"));
    expect(onSet).toHaveBeenCalledWith("whole");
  });
});
```

- [ ] **Step 2: Run to verify failure**

```bash
bun run test components/manipulatives/NumberBond.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement `components/manipulatives/NumberBond.tsx`**

```tsx
"use client";

interface Props {
  whole: number | null;
  partA: number | null;
  partB: number | null;
  onSet: (slot: "whole" | "partA" | "partB") => void;
}

function Circle({
  value,
  testId,
  onClick,
}: {
  value: number | null;
  testId: string;
  onClick: () => void;
}) {
  return (
    <button
      data-testid={testId}
      onClick={onClick}
      className="w-24 h-24 rounded-full bg-white border-4 border-ink/80 flex items-center justify-center text-3xl font-bold"
    >
      {value ?? "?"}
    </button>
  );
}

export function NumberBond({ whole, partA, partB, onSet }: Props) {
  return (
    <div className="flex flex-col items-center gap-4">
      <Circle value={whole} testId="nb-whole" onClick={() => onSet("whole")} />
      <div className="flex gap-8">
        <div className="flex flex-col items-center">
          <div className="w-1 h-6 bg-ink/70" />
          <Circle
            value={partA}
            testId="nb-part-a"
            onClick={() => onSet("partA")}
          />
        </div>
        <div className="flex flex-col items-center">
          <div className="w-1 h-6 bg-ink/70" />
          <Circle
            value={partB}
            testId="nb-part-b"
            onClick={() => onSet("partB")}
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run to verify pass**

```bash
bun run test components/manipulatives/NumberBond.test.tsx
```

Expected: PASS — 2 tests.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: NumberBond manipulative (whole + two parts)"
```

---

## Phase 6 — Input components

### Task 20: AnswerTiles component

**Files:**

- Create: `components/input/AnswerTiles.tsx`, `components/input/AnswerTiles.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AnswerTiles } from "./AnswerTiles";

describe("AnswerTiles", () => {
  it("renders one tile per option in shuffled order", () => {
    render(
      <AnswerTiles options={[5, 7, 6]} onPick={() => {}} disabled={false} />,
    );
    expect(screen.getAllByTestId("at-tile").length).toBe(3);
  });

  it("clicking a tile calls onPick with its value", () => {
    const onPick = vi.fn();
    render(
      <AnswerTiles options={[5, 7, 6]} onPick={onPick} disabled={false} />,
    );
    fireEvent.click(screen.getAllByTestId("at-tile")[0]);
    expect(onPick).toHaveBeenCalled();
  });

  it("does not call onPick when disabled", () => {
    const onPick = vi.fn();
    render(<AnswerTiles options={[5, 7, 6]} onPick={onPick} disabled />);
    fireEvent.click(screen.getAllByTestId("at-tile")[0]);
    expect(onPick).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run to verify failure**

```bash
bun run test components/input/AnswerTiles.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement `components/input/AnswerTiles.tsx`**

```tsx
"use client";
import { motion } from "framer-motion";
import { play } from "@/lib/sound";

interface Props {
  options: number[];
  onPick: (v: number) => void;
  disabled: boolean;
}

export function AnswerTiles({ options, onPick, disabled }: Props) {
  return (
    <div className="flex flex-col gap-4 w-full">
      {options.map((v, i) => (
        <motion.button
          key={`${v}-${i}`}
          data-testid="at-tile"
          disabled={disabled}
          onClick={() => {
            play("tap");
            onPick(v);
          }}
          whileTap={{ scale: 0.95 }}
          className="w-full py-6 text-4xl font-bold bg-white rounded-2xl border-4 border-ink/80 disabled:opacity-50"
        >
          {v}
        </motion.button>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run to verify pass**

```bash
bun run test components/input/AnswerTiles.test.tsx
```

Expected: PASS — 3 tests.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: AnswerTiles input"
```

---

### Task 21: NumberPad component

**Files:**

- Create: `components/input/NumberPad.tsx`, `components/input/NumberPad.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NumberPad } from "./NumberPad";

describe("NumberPad", () => {
  it("renders digits 0-9 and a confirm button", () => {
    render(<NumberPad onConfirm={() => {}} disabled={false} />);
    for (let d = 0; d <= 9; d++)
      expect(screen.getByTestId(`np-${d}`)).toBeInTheDocument();
    expect(screen.getByTestId("np-confirm")).toBeInTheDocument();
  });

  it("tapping digits builds the value, confirm emits it", () => {
    const onConfirm = vi.fn();
    render(<NumberPad onConfirm={onConfirm} disabled={false} />);
    fireEvent.click(screen.getByTestId("np-1"));
    fireEvent.click(screen.getByTestId("np-3"));
    fireEvent.click(screen.getByTestId("np-confirm"));
    expect(onConfirm).toHaveBeenCalledWith(13);
  });
});
```

- [ ] **Step 2: Run to verify failure**

```bash
bun run test components/input/NumberPad.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement `components/input/NumberPad.tsx`**

```tsx
"use client";
import { useState } from "react";
import { play } from "@/lib/sound";

interface Props {
  onConfirm: (value: number) => void;
  disabled: boolean;
}

export function NumberPad({ onConfirm, disabled }: Props) {
  const [buf, setBuf] = useState("");
  const tapDigit = (d: number) => {
    if (disabled || buf.length >= 3) return;
    play("tap");
    setBuf(buf + d);
  };
  const confirm = () => {
    if (disabled || !buf) return;
    onConfirm(parseInt(buf, 10));
    setBuf("");
  };
  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="text-5xl font-bold bg-white rounded-2xl border-4 border-ink/80 p-4 text-center min-h-[72px]">
        {buf || " "}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
          <button
            key={d}
            data-testid={`np-${d}`}
            disabled={disabled}
            onClick={() => tapDigit(d)}
            className="py-4 text-2xl font-bold bg-white rounded-xl border-2 border-ink/80"
          >
            {d}
          </button>
        ))}
        <button
          onClick={() => setBuf("")}
          className="py-4 text-lg bg-coral/30 rounded-xl border-2 border-ink/80"
        >
          Clear
        </button>
        <button
          data-testid="np-0"
          disabled={disabled}
          onClick={() => tapDigit(0)}
          className="py-4 text-2xl font-bold bg-white rounded-xl border-2 border-ink/80"
        >
          0
        </button>
        <button
          data-testid="np-confirm"
          disabled={disabled}
          onClick={confirm}
          className="py-4 text-lg font-bold bg-yellow rounded-xl border-2 border-ink/80"
        >
          ✓
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run to verify pass**

```bash
bun run test components/input/NumberPad.test.tsx
```

Expected: PASS — 2 tests.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: NumberPad input with build-and-confirm"
```

---

## Phase 7 — Mascot

### Task 22: Mascot SVG sprites

**Files:**

- Create: `public/mascot/idle.svg`, `watching.svg`, `thinking.svg`, `happy.svg`, `encouraging.svg`, `celebrating.svg`

- [ ] **Step 1: Author 6 fox SVGs**

For the V1, hand-author a single base fox SVG and create 6 emotion variants by changing facial features. Save each as a self-contained SVG (viewBox 0 0 200 200, fill colours from palette). Use orange `#E8923C` body, cream `#FAF1E1` belly, black `#2D2A26` 2.5px outline.

Each file should be ~80 lines of SVG. Reference implementation for `idle.svg`:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <!-- body -->
  <ellipse cx="100" cy="140" rx="50" ry="45" fill="#E8923C" stroke="#2D2A26" stroke-width="2.5"/>
  <!-- belly -->
  <ellipse cx="100" cy="155" rx="30" ry="25" fill="#FAF1E1"/>
  <!-- head -->
  <circle cx="100" cy="80" r="50" fill="#E8923C" stroke="#2D2A26" stroke-width="2.5"/>
  <!-- ears -->
  <polygon points="60,50 75,20 90,50" fill="#E8923C" stroke="#2D2A26" stroke-width="2.5"/>
  <polygon points="110,50 125,20 140,50" fill="#E8923C" stroke="#2D2A26" stroke-width="2.5"/>
  <!-- snout -->
  <ellipse cx="100" cy="95" rx="20" ry="15" fill="#FAF1E1"/>
  <!-- nose -->
  <circle cx="100" cy="88" r="4" fill="#2D2A26"/>
  <!-- eyes (idle: open circles) -->
  <circle cx="83" cy="72" r="4" fill="#2D2A26"/>
  <circle cx="117" cy="72" r="4" fill="#2D2A26"/>
  <!-- tail -->
  <ellipse cx="155" cy="135" rx="15" ry="25" fill="#E8923C" stroke="#2D2A26" stroke-width="2.5" transform="rotate(30 155 135)"/>
</svg>
```

Variants:

- `watching.svg`: same, but shift eyes (cx) by +3 (looking right)
- `thinking.svg`: lift eyebrows (add two short lines above eyes), add small "?" group at top-right
- `happy.svg`: replace eye circles with upward-arc paths (squinting)
- `encouraging.svg`: widen eyes (r=5), tilt head (group transform rotate(-5 100 100))
- `celebrating.svg`: closed eyes (arcs), open mouth (small ellipse), tail visible

The implementer may use a vector editor (Figma/Inkscape) or hand-code these. They should look like the same character in different emotional states. ~30 min total.

- [ ] **Step 2: Commit**

```bash
git add public/mascot
git commit -m "feat: mascot SVG sprites for 6 emotion states"
```

---

### Task 23: Mascot React component

**Files:**

- Create: `components/mascot/Mascot.tsx`, `components/mascot/Mascot.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Mascot } from "./Mascot";

describe("Mascot", () => {
  it("shows the requested emotion sprite", () => {
    render(<Mascot emotion="happy" />);
    expect(screen.getByTestId("mascot-img")).toHaveAttribute(
      "src",
      expect.stringContaining("happy.svg"),
    );
  });

  it("idle is the default", () => {
    render(<Mascot />);
    expect(screen.getByTestId("mascot-img")).toHaveAttribute(
      "src",
      expect.stringContaining("idle.svg"),
    );
  });
});
```

- [ ] **Step 2: Run to verify failure**

```bash
bun run test components/mascot/Mascot.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement `components/mascot/Mascot.tsx`**

```tsx
"use client";
import { motion } from "framer-motion";

export type MascotEmotion =
  | "idle"
  | "watching"
  | "thinking"
  | "happy"
  | "encouraging"
  | "celebrating";

interface Props {
  emotion?: MascotEmotion;
}

const sizes: Record<MascotEmotion, number> = {
  idle: 180,
  watching: 180,
  thinking: 180,
  happy: 180,
  encouraging: 180,
  celebrating: 220,
};

export function Mascot({ emotion = "idle" }: Props) {
  return (
    <motion.div
      key={emotion}
      initial={emotion === "happy" ? { y: 0 } : undefined}
      animate={
        emotion === "happy"
          ? { y: [0, -40, 0] }
          : emotion === "celebrating"
            ? { rotate: [-5, 5, -5, 5, 0] }
            : undefined
      }
      transition={{ type: "spring", stiffness: 300, damping: 12 }}
    >
      <img
        data-testid="mascot-img"
        src={`/mascot/${emotion}.svg`}
        alt={`Riko ${emotion}`}
        width={sizes[emotion]}
        height={sizes[emotion]}
        draggable={false}
      />
    </motion.div>
  );
}
```

- [ ] **Step 4: Run to verify pass**

```bash
bun run test components/mascot/Mascot.test.tsx
```

Expected: PASS — 2 tests.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: Mascot component with emotion-driven animation"
```

---

## Phase 8 — Layout and feedback

### Task 24: LessonShell layout (3-zone)

**Files:**

- Create: `components/layout/LessonShell.tsx`

- [ ] **Step 1: Implement**

```tsx
"use client";
import type { ReactNode } from "react";

interface Props {
  left: ReactNode;
  centre: ReactNode;
  right: ReactNode;
  bottom: ReactNode;
}

export function LessonShell({ left, centre, right, bottom }: Props) {
  return (
    <div className="h-screen w-screen flex flex-col bg-cream">
      <div className="flex-1 grid grid-cols-[22fr_56fr_22fr] gap-6 p-6">
        <div className="flex flex-col items-center justify-end">{left}</div>
        <div className="flex items-center justify-center">{centre}</div>
        <div className="flex items-center justify-center">{right}</div>
      </div>
      <div className="h-16 px-6 flex items-center">{bottom}</div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: LessonShell 3-zone landscape layout"
```

---

### Task 25: ProgressBar component

**Files:**

- Create: `components/layout/ProgressBar.tsx`, `components/layout/ProgressBar.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressBar } from "./ProgressBar";

describe("ProgressBar", () => {
  it("renders total dots and fills the first n", () => {
    render(<ProgressBar total={5} filled={2} />);
    expect(screen.getAllByTestId("pb-dot").length).toBe(5);
    expect(screen.getAllByTestId("pb-dot-filled").length).toBe(2);
  });
});
```

- [ ] **Step 2: Run to verify failure**

```bash
bun run test components/layout/ProgressBar.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement `components/layout/ProgressBar.tsx`**

```tsx
"use client";

interface Props {
  total: number;
  filled: number;
}

export function ProgressBar({ total, filled }: Props) {
  return (
    <div className="flex gap-2 w-full">
      {Array.from({ length: total }, (_, i) => {
        const on = i < filled;
        return (
          <div
            key={i}
            data-testid={on ? "pb-dot-filled" : "pb-dot"}
            className={`flex-1 h-4 rounded-full border-2 border-ink/60 ${on ? "bg-yellow" : "bg-white"}`}
          />
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Run to verify pass**

```bash
bun run test components/layout/ProgressBar.test.tsx
```

Expected: PASS — 1 test.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: ProgressBar dots"
```

---

### Task 26: Feedback components

**Files:**

- Create: `components/feedback/Feedback.tsx`

- [ ] **Step 1: Implement** — three named exports, each a short Framer Motion animation:

```tsx
"use client";
import { motion, AnimatePresence } from "framer-motion";

export function CorrectBurst({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1.4, opacity: 1 }}
          exit={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 pointer-events-none flex items-center justify-center"
        >
          <div className="w-32 h-32 rounded-full bg-yellow/40" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function GentleShake({
  children,
  trigger,
}: {
  children: React.ReactNode;
  trigger: number;
}) {
  return (
    <motion.div
      key={trigger}
      animate={{ rotate: [0, -8, 8, -4, 0] }}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}

export function StuckHint({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-yellow/30 border-2 border-ink/60 rounded-xl p-4 text-lg"
    >
      {message}
    </motion.div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: feedback animation primitives"
```

---

## Phase 9 — Pages

### Task 27: Lesson player page

**Files:**

- Create: `app/lesson/[id]/page.tsx`, `components/layout/LessonPlayer.tsx`

- [ ] **Step 1: Create `app/lesson/[id]/page.tsx`**

```tsx
import { LessonPlayer } from "@/components/layout/LessonPlayer";
import { allLessons } from "@/lessons";

export function generateStaticParams() {
  return Object.keys(allLessons).map((id) => ({ id }));
}

export default function LessonPage({ params }: { params: { id: string } }) {
  return <LessonPlayer lessonId={params.id} />;
}
```

- [ ] **Step 2: Implement `components/layout/LessonPlayer.tsx`** — the orchestrator:

```tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  Problem,
  ManipulativeKind,
  PhaseKind,
  LessonAttemptResult,
} from "@/lib/types";
import { getLesson } from "@/lessons";
import { generateProblems } from "@/engine/problemGenerator";
import { generateDistractors } from "@/engine/distractors";
import { computeStars, didPass } from "@/engine/masteryTracker";
import { useAppStore } from "@/engine/store";
import { LessonShell } from "./LessonShell";
import { Mascot, type MascotEmotion } from "@/components/mascot/Mascot";
import { TensFrame } from "@/components/manipulatives/TensFrame";
import { DoubleTensFrame } from "@/components/manipulatives/DoubleTensFrame";
import { PlaceValueBlocks } from "@/components/manipulatives/PlaceValueBlocks";
import { EqualGroups } from "@/components/manipulatives/EqualGroups";
import { ArrayGrid } from "@/components/manipulatives/ArrayGrid";
import { NumberLine } from "@/components/manipulatives/NumberLine";
import { NumberBond } from "@/components/manipulatives/NumberBond";
import { AnswerTiles } from "@/components/input/AnswerTiles";
import { NumberPad } from "@/components/input/NumberPad";
import { ProgressBar } from "./ProgressBar";
import { CorrectBurst, GentleShake } from "@/components/feedback/Feedback";
import { play } from "@/lib/sound";

interface PhaseList {
  problems: Problem[];
  phase: PhaseKind;
}

export function LessonPlayer({ lessonId }: { lessonId: string }) {
  const router = useRouter();
  const lesson = getLesson(lessonId);
  const { progress, commitProgress } = useAppStore();
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phase, setPhase] = useState<PhaseKind>("intro");
  const [problemIndex, setProblemIndex] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [showCorrect, setShowCorrect] = useState(false);
  const [shakeTrigger, setShakeTrigger] = useState(0);
  const [emotion, setEmotion] = useState<MascotEmotion>("idle");
  const [outcome, setOutcome] = useState({
    practiceFirstTryCorrect: 0,
    practiceTotal: 0,
    quizFirstTryCorrect: 0,
    quizTotal: 0,
  });
  const [triggeredStuckHint, setTriggeredStuckHint] = useState(false);

  const phases: PhaseList[] = useMemo(() => {
    if (!lesson) return [];
    const intro: Problem[] = lesson.intro.map((p, i) => ({
      id: `i-${i}`,
      a: p.a,
      b: p.b,
      answer: p.a + p.b,
      inputMode: "tap",
    }));
    const practice = generateProblems(
      lesson.practiceTemplate,
      `${lessonId}-practice`,
    );
    const quiz = generateProblems(lesson.quizTemplate, `${lessonId}-quiz`).map(
      (p) => ({ ...p, inputMode: "type" as const }),
    );
    return [
      { phase: "intro", problems: intro },
      { phase: "practice", problems: practice },
      { phase: "quiz", problems: quiz },
    ];
  }, [lesson, lessonId]);

  if (!lesson) return <div className="p-8">Lesson not found.</div>;

  const currentList = phases[phaseIndex];
  const currentProblem = currentList?.problems[problemIndex];
  if (!currentProblem) return <div className="p-8">Loading…</div>;

  const onCorrect = () => {
    play("correct");
    setShowCorrect(true);
    setEmotion("happy");
    setTimeout(() => {
      setShowCorrect(false);
      setEmotion("idle");
      const firstTry = wrongCount === 0;
      const newOutcome = { ...outcome };
      if (phase === "practice") {
        newOutcome.practiceTotal++;
        if (firstTry) newOutcome.practiceFirstTryCorrect++;
      } else if (phase === "quiz") {
        newOutcome.quizTotal++;
        if (firstTry) newOutcome.quizFirstTryCorrect++;
      }
      setOutcome(newOutcome);
      setWrongCount(0);
      const nextIndex = problemIndex + 1;
      if (nextIndex >= currentList.problems.length) {
        const nextPhase = phaseIndex + 1;
        if (nextPhase >= phases.length) finishLesson(newOutcome);
        else {
          setPhaseIndex(nextPhase);
          setProblemIndex(0);
          setPhase(phases[nextPhase].phase);
        }
      } else setProblemIndex(nextIndex);
    }, 700);
  };

  const onWrong = () => {
    play("wrong");
    setShakeTrigger((t) => t + 1);
    setEmotion("encouraging");
    setWrongCount((w) => w + 1);
    if (wrongCount + 1 >= 2) setTriggeredStuckHint(true);
    setTimeout(() => setEmotion("idle"), 600);
  };

  const finishLesson = (final: typeof outcome) => {
    const stars = computeStars(final, triggeredStuckHint);
    const passed = didPass(final);
    const newBlob = structuredClone(progress);
    newBlob.lessons[lessonId] = {
      stars,
      firstTryAccuracy:
        (final.practiceFirstTryCorrect + final.quizFirstTryCorrect) /
        (final.practiceTotal + final.quizTotal),
      attempts: (newBlob.lessons[lessonId]?.attempts ?? 0) + 1,
      completedAt: new Date().toISOString(),
    };
    if (!passed)
      newBlob.failedAttemptCounts[lessonId] =
        (newBlob.failedAttemptCounts[lessonId] ?? 0) + 1;
    else delete newBlob.failedAttemptCounts[lessonId];
    if (passed && lesson.unlocks[0])
      newBlob.currentLessonId = lesson.unlocks[0];
    commitProgress(newBlob);
    play("win");
    router.push(`/done?lesson=${lessonId}&stars=${stars}`);
  };

  const submitTap = (v: number) =>
    v === currentProblem.answer ? onCorrect() : onWrong();
  const submitType = (v: number) =>
    v === currentProblem.answer ? onCorrect() : onWrong();

  const renderManipulative = (kind: ManipulativeKind) => {
    const p = currentProblem;
    switch (kind) {
      case "tens-frame":
        return <TensFrame filled={p.a} mode="fill" onChange={() => {}} />;
      case "double-tens-frame":
        return (
          <DoubleTensFrame leftFilled={p.a} rightFilled={0} onAdd={() => {}} />
        );
      case "place-value-blocks":
        return (
          <PlaceValueBlocks
            tens={Math.floor(p.a / 10)}
            ones={p.a % 10}
            onChange={() => {}}
          />
        );
      case "equal-groups":
        return (
          <EqualGroups
            plates={p.a}
            perPlate={p.b}
            countedPlates={0}
            onCount={() => {}}
          />
        );
      case "array-grid":
        return (
          <ArrayGrid
            rows={p.a}
            cols={p.b}
            rotated={false}
            onRotate={() => {}}
          />
        );
      case "number-line":
        return <NumberLine max={20} frogAt={p.a} onHop={() => {}} />;
      case "number-bond":
        return (
          <NumberBond
            whole={p.a + p.b}
            partA={p.a}
            partB={null}
            onSet={() => {}}
          />
        );
    }
  };

  const tileOptions = useMemo(() => {
    if (currentProblem.inputMode !== "tap") return [];
    const distractors = generateDistractors(
      currentProblem.answer,
      `${lessonId}-${currentProblem.id}`,
    );
    return shuffle(
      [currentProblem.answer, ...distractors],
      `${lessonId}-${currentProblem.id}`,
    );
  }, [currentProblem, lessonId]);

  return (
    <LessonShell
      left={
        <div className="flex flex-col items-center gap-4">
          <Mascot emotion={emotion} />
          <div className="bg-white border-4 border-ink/80 rounded-2xl p-4 text-2xl font-bold text-center">
            {lesson.track === "multiplication"
              ? `What is ${currentProblem.a} × ${currentProblem.b}?`
              : phase === "quiz"
                ? `${currentProblem.a} ${lesson.track === "subtraction" ? "−" : "+"} ${currentProblem.b} = ?`
                : `How many altogether?`}
          </div>
        </div>
      }
      centre={
        <div className="relative">
          <GentleShake trigger={shakeTrigger}>
            {renderManipulative(lesson.manipulative)}
          </GentleShake>
          <CorrectBurst show={showCorrect} />
        </div>
      }
      right={
        currentProblem.inputMode === "tap" ? (
          <AnswerTiles
            options={tileOptions}
            onPick={submitTap}
            disabled={showCorrect}
          />
        ) : (
          <NumberPad onConfirm={submitType} disabled={showCorrect} />
        )
      }
      bottom={
        <ProgressBar
          total={currentList.problems.length}
          filled={problemIndex}
        />
      }
    />
  );
}

function shuffle<T>(arr: T[], seed: string): T[] {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const rng = () => {
    h = Math.imul(h ^ (h >>> 15), h | 1);
    h ^= h + Math.imul(h ^ (h >>> 7), h | 61);
    return ((h ^ (h >>> 14)) >>> 0) / 4294967296;
  };
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
```

- [ ] **Step 3: Verify the lesson page builds and loads**

```bash
bun run dev
```

Open `http://localhost:3000/lesson/add-10-review-01` — verify the lesson loads and a problem renders.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: lesson player orchestrating manipulative + input + feedback"
```

---

### Task 28: Lesson map and home page

**Files:**

- Modify: `app/page.tsx`
- Create: `components/layout/LessonMap.tsx`

- [ ] **Step 1: Implement `components/layout/LessonMap.tsx`**

```tsx
"use client";
import Link from "next/link";
import { allLessons } from "@/lessons";
import { useAppStore } from "@/engine/store";
import { Mascot } from "@/components/mascot/Mascot";
import { useEffect } from "react";

export function LessonMap() {
  const { progress, hydrate } = useAppStore();
  useEffect(() => {
    hydrate();
  }, [hydrate]);
  const lessons = Object.values(allLessons);
  return (
    <div className="h-screen w-screen p-6 overflow-x-auto bg-cream">
      <div className="flex items-center gap-8 h-full min-w-max">
        {lessons.map((lesson) => {
          const record = progress.lessons[lesson.id];
          const isCurrent = lesson.id === progress.currentLessonId;
          const isCompleted = !!record;
          const trackColour =
            lesson.track === "addition"
              ? "bg-yellow"
              : lesson.track === "subtraction"
                ? "bg-blue"
                : "bg-coral";
          return (
            <Link
              key={lesson.id}
              href={`/lesson/${lesson.id}`}
              className="flex flex-col items-center gap-2"
            >
              {isCurrent && <Mascot emotion="idle" />}
              <div
                className={`w-32 h-32 rounded-full border-4 border-ink/80 flex items-center justify-center text-2xl ${trackColour} ${!isCompleted && !isCurrent ? "opacity-40" : ""}`}
              >
                {isCompleted ? "⭐".repeat(record.stars) : ""}
              </div>
              <div className="text-sm font-medium">{lesson.title}</div>
            </Link>
          );
        })}
      </div>
      <div className="absolute bottom-4 right-4 text-xs text-ink/40">
        v1.0.0
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Replace `app/page.tsx`**

```tsx
import { LessonMap } from "@/components/layout/LessonMap";

export default function HomePage() {
  return <LessonMap />;
}
```

- [ ] **Step 3: Verify in browser**

```bash
bun run dev
```

Open `http://localhost:3000/` — see the lesson map with the mascot on the first stone.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: lesson map home page"
```

---

### Task 29: Done celebration screen

**Files:**

- Create: `app/done/page.tsx`

- [ ] **Step 1: Implement**

```tsx
"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mascot } from "@/components/mascot/Mascot";

export default function DonePage() {
  const params = useSearchParams();
  const stars = parseInt(params.get("stars") ?? "0", 10);
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center gap-6 bg-cream">
      <Mascot emotion="celebrating" />
      <div className="text-6xl">{"⭐".repeat(stars)}</div>
      <Link
        href="/"
        className="px-8 py-4 bg-yellow rounded-2xl border-4 border-ink/80 text-2xl font-bold"
      >
        Next →
      </Link>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: done celebration screen"
```

---

### Task 30: Parent view (hidden route)

**Files:**

- Create: `app/parent/page.tsx`

- [ ] **Step 1: Implement**

```tsx
"use client";
import { useAppStore } from "@/engine/store";
import { resetProgress, STORAGE_KEY, loadProgress } from "@/engine/storage";
import { useEffect, useState } from "react";

export default function ParentPage() {
  const { progress, hydrate } = useAppStore();
  const [confirmReset, setConfirmReset] = useState(false);
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const lessonsThisWeek = progress.sessionHistory
    .filter((s) => {
      const d = new Date(s.date).getTime();
      return d > Date.now() - 7 * 24 * 60 * 60 * 1000;
    })
    .reduce((sum, s) => sum + s.lessonsCompleted, 0);

  const needsPractice = Object.entries(progress.lessons)
    .filter(([_, r]) => r.attempts > 1)
    .map(([id]) => id);

  const exportProgress = () => {
    const blob = new Blob([JSON.stringify(loadProgress(), null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "math-tutor-progress.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    resetProgress();
    location.href = "/";
  };

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Parent view</h1>
      <div>
        <strong>Current lesson:</strong> {progress.currentLessonId}
      </div>
      <div>
        <strong>Lessons completed this week:</strong> {lessonsThisWeek}
      </div>
      <div>
        <strong>Skills needing practice:</strong>{" "}
        {needsPractice.length ? needsPractice.join(", ") : "none"}
      </div>
      <div className="flex gap-4">
        <button
          onClick={exportProgress}
          className="px-4 py-2 bg-blue rounded-xl border-2 border-ink/80"
        >
          Export progress
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-coral rounded-xl border-2 border-ink/80"
        >
          {confirmReset ? "Tap again to confirm reset" : "Reset progress"}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Wire the version-tap gesture in `components/layout/LessonMap.tsx`**

Modify the version line in `LessonMap.tsx`:

```tsx
import { useRouter } from "next/navigation";
// inside the component:
const router = useRouter();
const [tapCount, setTapCount] = useState(0);
const handleVersionTap = () => {
  const next = tapCount + 1;
  setTapCount(next);
  if (next >= 5) router.push("/parent");
  setTimeout(() => setTapCount(0), 3000);
};
// replace the version div:
<button
  onClick={handleVersionTap}
  className="absolute bottom-4 right-4 text-xs text-ink/40"
>
  v1.0.0
</button>;
```

(Implementer: add the `useState` import. The exact diff lives at the bottom of `LessonMap.tsx`.)

- [ ] **Step 3: Verify** — tap version 5 times within 3 seconds, route to `/parent`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: hidden parent view with export and reset"
```

---

## Phase 10 — Content

### Task 31: Author all 55 lessons

**Files:**

- Create: 54 more files in `lessons/*.json`
- Modify: `lessons/index.ts`

- [ ] **Step 1: Author lesson JSON files**

Create one JSON file per lesson, named `<track-prefix>-<sub-skill>-<NN>.json` with the schema from Task 5 / Task 11. The full list of 55 lesson IDs:

```
add-10-review-01, 02, 03                            (3, tens-frame, range 2-5)
add-10-bonds-01..05                                 (5, tens-frame + number-bond, sum<=10)
add-20-make-ten-01..06                              (6, double-tens-frame, sum>10)
add-100-01..05                                      (5, place-value-blocks)
sub-5-takeaway-01..03                               (3, tens-frame mode=take-away)
sub-10-countback-01..05                             (5, tens-frame + number-line)
sub-10-missing-01..04                               (4, number-bond)
sub-20-cross-ten-01..05                             (5, double-tens-frame)
mul-groups-01..04                                   (4, equal-groups, a in 2-5, b in 2-5)
mul-arrays-01..04                                   (4, array-grid)
mul-skip-01..05                                     (5, number-line with step 2/5/10)
mul-times-01..06                                    (6, array-grid, ×2/×5/×10)
```

For each file, follow this pattern (adjusting ranges, manipulative, and constraint per the table above):

```json
{
  "id": "add-10-bonds-01",
  "track": "addition",
  "title": "Numbers that make 10",
  "skill": "add-within-10-bonds",
  "manipulative": "number-bond",
  "intro": [
    { "a": 7, "b": 3 },
    { "a": 6, "b": 4 },
    { "a": 8, "b": 2 }
  ],
  "practiceTemplate": {
    "type": "add",
    "aRange": [1, 9],
    "bRange": [1, 9],
    "constraint": "sum <= 10",
    "count": 5
  },
  "quizTemplate": {
    "type": "add",
    "aRange": [1, 9],
    "bRange": [1, 9],
    "constraint": "sum <= 10",
    "count": 3,
    "showHint": false
  },
  "prerequisites": ["add-10-review-03"],
  "unlocks": ["add-10-bonds-02"]
}
```

Use these guidelines:

- **add-10-review-NN:** sum ≤ 10, manipulative `tens-frame`
- **add-10-bonds-NN:** sum ≤ 10, manipulative `number-bond`
- **add-20-make-ten-NN:** type `make-ten`, constraint `sum > 10`, a in 6-9, b in 3-7, manipulative `double-tens-frame`
- **add-100-NN:** type `add`, a in 10-50, b in 10-50, no constraint, manipulative `place-value-blocks`
- **sub-NN:** type `subtract`, manipulative as listed
- **mul-NN:** type `equal-groups` or `array`, a/b in small ranges, manipulative as listed

Each lesson's `prerequisites` is the previous lesson in the sequence; `unlocks` is the next one.

- [ ] **Step 2: Update `lessons/index.ts` to import all 55 files**

```typescript
import type { Lesson } from "@/lib/types";
// imports for all 55 files
import addReview01 from "./add-10-review-01.json";
import addReview02 from "./add-10-review-02.json";
// ... (53 more)
import mulTimes06 from "./mul-times-06.json";

export const allLessons: Record<string, Lesson> = {
  "add-10-review-01": addReview01 as Lesson,
  "add-10-review-02": addReview02 as Lesson,
  // ... (53 more)
  "mul-times-06": mulTimes06 as Lesson,
};

export function getLesson(id: string): Lesson | undefined {
  return allLessons[id];
}
```

- [ ] **Step 3: Verify all lessons load**

```bash
bun run dev
```

Visit `/` — all 55 stones should render in the map.

- [ ] **Step 4: Commit**

```bash
git add lessons
git commit -m "feat: author all 55 lesson definitions"
```

---

## Phase 11 — PWA

### Task 32: PWA manifest and icons

**Files:**

- Create: `public/manifest.webmanifest`, `public/icon-192.png`, `public/icon-512.png`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create `public/manifest.webmanifest`**

```json
{
  "name": "Riko's Math",
  "short_name": "Riko Math",
  "description": "A calm maths tutor for young children",
  "start_url": "/",
  "display": "fullscreen",
  "orientation": "landscape",
  "background_color": "#FAF1E1",
  "theme_color": "#E8923C",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

- [ ] **Step 2: Generate icons** — render the mascot SVG to PNG at 192 and 512 px (use `sharp` CLI, ImageMagick, or any vector→raster tool). Save as `public/icon-192.png` and `public/icon-512.png`.

- [ ] **Step 3: Link the manifest in `app/layout.tsx` metadata**

Update the metadata block:

```tsx
export const metadata: Metadata = {
  title: "Riko's Math",
  description: "A calm maths tutor for young children",
  manifest: "/manifest.webmanifest",
};
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: PWA manifest + icons"
```

---

### Task 33: Service worker for offline

**Files:**

- Create: `public/sw.js`, `app/sw-register.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create `public/sw.js`**

```javascript
const CACHE = "riko-math-v1";
const ASSETS = ["/", "/manifest.webmanifest", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then(
      (cached) =>
        cached ||
        fetch(event.request)
          .then((resp) => {
            const copy = resp.clone();
            caches.open(CACHE).then((c) => c.put(event.request, copy));
            return resp;
          })
          .catch(() => cached),
    ),
  );
});
```

- [ ] **Step 2: Create `app/sw-register.tsx`**

```tsx
"use client";
import { useEffect } from "react";

export function SwRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}
```

- [ ] **Step 3: Mount in `app/layout.tsx`**

```tsx
import { SwRegister } from "./sw-register";
// inside <body>:
<SwRegister />;
{
  children;
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: service worker for offline app shell"
```

---

## Phase 12 — Sound assets and final integration

### Task 34: Sound effect assets

**Files:**

- Create: `public/sounds/correct.mp3`, `wrong.mp3`, `win.mp3`, `drop.mp3`, `tap.mp3`

- [ ] **Step 1: Source royalty-free sounds**

Download CC0-licensed sounds from https://freesound.org or https://pixabay.com/sound-effects/:

- `correct.mp3` — short bright chime (~0.6s)
- `wrong.mp3` — soft low thunk (~0.4s)
- `win.mp3` — celebratory chord (~1.5s)
- `drop.mp3` — soft click (~0.2s)
- `tap.mp3` — UI tap (~0.1s)

Save each in `public/sounds/`. Confirm files exist:

```bash
ls public/sounds
```

Expected: 5 mp3 files.

- [ ] **Step 2: Smoke test** — load the app, complete a problem, verify a chime plays on correct.

- [ ] **Step 3: Commit**

```bash
git add public/sounds
git commit -m "feat: sound effect assets"
```

---

### Task 35: Final integration verification

**Files:** none

- [ ] **Step 1: Run the full test suite**

```bash
bun run test
```

Expected: all 45 tests PASS.

- [ ] **Step 2: Build the static export**

```bash
bun run build
```

Expected: build succeeds; output written to `out/`.

- [ ] **Step 3: Serve the static build locally**

```bash
bunx serve out -l 8080
```

Open http://localhost:8080 on the desktop browser first. Verify:

- Lesson map shows all 55 lessons with mascot on the current one.
- Tap a lesson → 3 intro problems → 5 practice → 3 quiz → done screen.
- Sounds play on correct/wrong/win.
- Refresh the page → progress persists.
- Tap version number 5 times → parent view loads.
- Reset progress → returns to lesson 1.

- [ ] **Step 4: Install on the Galaxy Tab S8+**

On the tablet:

1. Connect tablet to same Wi-Fi as the dev machine.
2. Find the dev machine's LAN IP (`ipconfig` on Windows).
3. Run `bunx serve out -l 8080 --host 0.0.0.0` on the dev machine.
4. On the tablet, open Chrome → navigate to `http://<lan-ip>:8080`.
5. Chrome menu → "Add to Home screen" → confirm.
6. Tap the home-screen icon → app launches full-screen in landscape.
7. Toggle airplane mode → reopen → verify it still works (service worker).

- [ ] **Step 5: Final commit and tag**

```bash
git add -A
git commit --allow-empty -m "chore: V1 ready for tablet install"
git tag v1.0.0
```

---

## Open items deferred to V2

- Hand-drawn mascot polish (replace SVG sprites with proper illustration if Riko looks stiff)
- Add a "review" mode for skills marked needs-practice in the parent view
- Add a fourth track (subtraction within 100 with regrouping)
- Optional cloud sync if a sibling needs to share progress

---

## Spec coverage check

| Spec section                  | Implemented in                                                                                                                      |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 1. Goals / non-goals          | Whole plan — all goals covered                                                                                                      |
| 2. Scope and curriculum tree  | Tasks 11, 31                                                                                                                        |
| 2. Lesson structure (3+5+3)   | Task 27                                                                                                                             |
| 2. Mastery gate               | Task 10                                                                                                                             |
| 2. Star rating                | Task 10                                                                                                                             |
| 3. Tech stack                 | Tasks 1, 2                                                                                                                          |
| 3. Folder layout              | Tasks 1, 5–33                                                                                                                       |
| 4.1 Lesson map                | Task 28                                                                                                                             |
| 4.2 Lesson player layout      | Tasks 24, 27                                                                                                                        |
| 4.3 Feedback states           | Tasks 26, 27                                                                                                                        |
| 4.4 Parent view               | Task 30                                                                                                                             |
| 5. All 7 manipulatives        | Tasks 13–19                                                                                                                         |
| 6. Mascot design              | Tasks 22, 23                                                                                                                        |
| 7.1 Lesson JSON schema        | Tasks 5, 11, 31                                                                                                                     |
| 7.2 Progress storage          | Tasks 5, 6                                                                                                                          |
| 8. Edge cases                 | Tasks 6 (corruption), 20/21 (disabled), 27 (resume), 32 (orientation lock), 11 (re-route), 12 (audio additive), 33 (no-SW fallback) |
| 9. Build / deploy / install   | Tasks 32, 35                                                                                                                        |
| 10. Mascot sourcing           | Task 22                                                                                                                             |
| 10. Sound sourcing            | Task 34                                                                                                                             |
| 10. Distractor generation     | Task 9                                                                                                                              |
| 10. Problem-generator seeding | Task 8 (mulberry32 + seed string)                                                                                                   |
