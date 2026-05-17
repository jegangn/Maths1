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
