export type Track = "addition" | "subtraction" | "multiplication";
export type ManipulativeKind =
  | "tens-frame"
  | "double-tens-frame"
  | "place-value-blocks"
  | "equal-groups"
  | "array-grid"
  | "number-line";

export type ProblemType =
  | "add"
  | "subtract"
  | "missing-addend"
  | "make-ten"
  | "equal-groups"
  | "array"
  | "skip-count";

export interface ProblemTemplate {
  type: ProblemType;
  aRange?: [number, number];
  bRange?: [number, number];
  constraint?: string;
  count: number;
  showHint?: boolean | string;
}

export interface IntroProblem {
  a: number;
  b: number;
  showHint?: string;
}

export interface Lesson {
  id: string;
  track: Track;
  title: string;
  skill: string;
  manipulative: ManipulativeKind;
  intro: IntroProblem[];
  practiceTemplate: ProblemTemplate;
  quizTemplate: ProblemTemplate;
  prerequisites: string[];
  unlocks: string[];
}

export interface Problem {
  id: string;
  a: number;
  b: number;
  answer: number;
  inputMode: "tap" | "type";
  distractors?: number[];
  showHint?: string;
}

export type PhaseKind = "intro" | "practice" | "quiz";

export interface LessonAttemptResult {
  lessonId: string;
  practiceFirstTryCorrect: number;
  practiceTotal: number;
  quizFirstTryCorrect: number;
  quizTotal: number;
  startedAt: string;
  completedAt: string;
}

export interface LessonProgress {
  stars: 0 | 1 | 2 | 3;
  firstTryAccuracy: number;
  attempts: number;
  completedAt: string;
}

export interface SkillMastery {
  successes: number;
  attempts: number;
  lastSeen: string;
}

export interface SessionEntry {
  date: string;
  minutesSpent: number;
  lessonsCompleted: number;
}

export interface ProgressBlob {
  version: 1;
  profile: { name: string; createdAt: string };
  currentLessonId: string;
  lessons: Record<string, LessonProgress>;
  skillMastery: Record<string, SkillMastery>;
  sessionHistory: SessionEntry[];
  failedAttemptCounts: Record<string, number>;
}
