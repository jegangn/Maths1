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
