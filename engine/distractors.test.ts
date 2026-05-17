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
