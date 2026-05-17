"use client";
import { useAppStore } from "@/engine/store";
import { resetProgress, loadProgress } from "@/engine/storage";
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
