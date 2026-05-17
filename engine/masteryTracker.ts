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
