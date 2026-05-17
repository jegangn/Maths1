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
