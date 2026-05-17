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
