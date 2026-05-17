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
