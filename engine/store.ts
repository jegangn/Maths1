import { create } from "zustand";
import type { ProgressBlob, Problem, PhaseKind } from "@/lib/types";
import { loadProgress, saveProgress } from "./storage";

interface AppState {
  progress: ProgressBlob;
  currentProblem: Problem | null;
  phase: PhaseKind;
  phaseIndex: number;
  wrongCount: number;
  hydrate: () => void;
  setProblem: (p: Problem | null, phase: PhaseKind, index: number) => void;
  recordWrong: () => void;
  recordCorrect: () => void;
  commitProgress: (blob: ProgressBlob) => void;
}

export const useAppStore = create<AppState>((set) => ({
  progress: loadProgress(),
  currentProblem: null,
  phase: "intro",
  phaseIndex: 0,
  wrongCount: 0,
  hydrate: () => set({ progress: loadProgress() }),
  setProblem: (p, phase, index) =>
    set({ currentProblem: p, phase, phaseIndex: index, wrongCount: 0 }),
  recordWrong: () => set((s) => ({ wrongCount: s.wrongCount + 1 })),
  recordCorrect: () => set({ wrongCount: 0 }),
  commitProgress: (blob) => {
    saveProgress(blob);
    set({ progress: blob });
  },
}));
