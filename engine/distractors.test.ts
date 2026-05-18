import { describe, it, expect } from "vitest";
import { generateDistractors } from "./distractors";

describe("generateDistractors", () => {
  it("returns two unique distractors close to the answer", () => {
    const d = generateDistractors(13, 9, 4, "seed-1");
    expect(d.length).toBe(2);
    expect(new Set(d).size).toBe(2);
    expect(d).not.toContain(13);
    for (const x of d) {
      expect(x).toBeGreaterThan(0);
      expect(Math.abs(x - 13)).toBeLessThanOrEqual(3);
    }
  });

  it("does not return negative numbers for small answers", () => {
    const d = generateDistractors(2, 1, 1, "seed-2");
    for (const x of d) expect(x).toBeGreaterThan(0);
  });

  it("is deterministic", () => {
    expect(generateDistractors(7, 3, 4, "s")).toEqual(
      generateDistractors(7, 3, 4, "s"),
    );
  });

  it("never equals a or b", () => {
    const a = 9;
    const b = 4;
    const d = generateDistractors(13, a, b, "seed-operands");
    expect(d).not.toContain(a);
    expect(d).not.toContain(b);
  });

  it("all distractors are strictly positive", () => {
    const d = generateDistractors(3, 5, 2, "seed-sub");
    for (const x of d) expect(x).toBeGreaterThan(0);
  });
});
