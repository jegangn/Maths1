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
