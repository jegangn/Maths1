"use client";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type {
  Problem,
  ManipulativeKind,
  PhaseKind,
  LessonAttemptResult,
} from "@/lib/types";
import { getLesson } from "@/lessons";
import { generateProblems } from "@/engine/problemGenerator";
import { generateDistractors } from "@/engine/distractors";
import { computeStars, didPass } from "@/engine/masteryTracker";
import { useAppStore } from "@/engine/store";
import { LessonShell } from "./LessonShell";
import { Mascot, type MascotEmotion } from "@/components/mascot/Mascot";
import {
  pickCharacterForLesson,
  pickVariant,
  type CelebrationVariant,
} from "@/lib/mascotData";
import { TensFrame } from "@/components/manipulatives/TensFrame";
import { DoubleTensFrame } from "@/components/manipulatives/DoubleTensFrame";
import { PlaceValueBlocks } from "@/components/manipulatives/PlaceValueBlocks";
import { EqualGroups } from "@/components/manipulatives/EqualGroups";
import { ArrayGrid } from "@/components/manipulatives/ArrayGrid";
import { NumberLine } from "@/components/manipulatives/NumberLine";
import { AnswerTiles } from "@/components/input/AnswerTiles";
import { NumberPad } from "@/components/input/NumberPad";
import { ProgressBar } from "./ProgressBar";
import { CorrectBurst, GentleShake } from "@/components/feedback/Feedback";
import { play } from "@/lib/sound";

const LS_KEY = "mathTutor.lessonState.v1";

interface PhaseList {
  problems: Problem[];
  phase: PhaseKind;
}

export function LessonPlayer({ lessonId }: { lessonId: string }) {
  const router = useRouter();
  const lesson = getLesson(lessonId);
  const { progress, commitProgress } = useAppStore();
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phase, setPhase] = useState<PhaseKind>("intro");
  const [problemIndex, setProblemIndex] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [showCorrect, setShowCorrect] = useState(false);
  const [shakeTrigger, setShakeTrigger] = useState(0);
  const [emotion, setEmotion] = useState<MascotEmotion>("idle");
  const [outcome, setOutcome] = useState({
    practiceFirstTryCorrect: 0,
    practiceTotal: 0,
    quizFirstTryCorrect: 0,
    quizTotal: 0,
  });
  const [triggeredStuckHint, setTriggeredStuckHint] = useState(false);
  const [streak, setStreak] = useState(0);
  const [celebration, setCelebration] = useState<
    CelebrationVariant | undefined
  >(undefined);
  // Same character for the whole lesson — deterministic per lessonId.
  const character = useMemo(() => pickCharacterForLesson(lessonId), [lessonId]);

  const phases: PhaseList[] = useMemo(() => {
    if (!lesson) return [];
    const computeAnswer = (a: number, b: number): number => {
      if (lesson.track === "multiplication") return a * b;
      if (lesson.track === "subtraction") return a - b;
      return a + b;
    };
    const intro: Problem[] = lesson.intro.map((p, i) => ({
      id: `i-${i}`,
      a: p.a,
      b: p.b,
      answer: computeAnswer(p.a, p.b),
      inputMode: "tap",
    }));
    const practice = generateProblems(
      lesson.practiceTemplate,
      `${lessonId}-practice`,
    );
    const quiz = generateProblems(lesson.quizTemplate, `${lessonId}-quiz`).map(
      (p) => ({ ...p, inputMode: "type" as const }),
    );
    return [
      { phase: "intro", problems: intro },
      { phase: "practice", problems: practice },
      { phase: "quiz", problems: quiz },
    ];
  }, [lesson, lessonId]);

  // Restore state from localStorage on mount (client-side only)
  useEffect(() => {
    if (!lesson) return;
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved.lessonId !== lessonId) return;
      // Restore valid saved state
      if (
        typeof saved.phaseIndex === "number" &&
        typeof saved.problemIndex === "number"
      ) {
        setPhaseIndex(saved.phaseIndex);
        setProblemIndex(saved.problemIndex);
        // Derive phase name from index once phases are available
        // phases may be [] here if lesson is undefined, but we guard above
      }
    } catch {
      // ignore corrupt data
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  // Keep phase in sync with phaseIndex after restoration
  useEffect(() => {
    if (phases.length > 0 && phases[phaseIndex]) {
      setPhase(phases[phaseIndex].phase);
    }
  }, [phases, phaseIndex]);

  if (!lesson) return <div className="p-8">Lesson not found.</div>;

  const currentList = phases[phaseIndex];
  const currentProblem = currentList?.problems[problemIndex];
  if (!currentProblem) return <div className="p-8">Loading…</div>;

  const saveState = (pIdx: number, prIdx: number) => {
    try {
      localStorage.setItem(
        LS_KEY,
        JSON.stringify({ lessonId, phaseIndex: pIdx, problemIndex: prIdx }),
      );
    } catch {
      // ignore
    }
  };

  const clearState = () => {
    try {
      localStorage.removeItem(LS_KEY);
    } catch {
      // ignore
    }
  };

  const onCorrect = () => {
    play("correct");
    setShowCorrect(true);
    const firstTry = wrongCount === 0;
    const nextStreak = firstTry ? streak + 1 : 1;
    setStreak(nextStreak);
    const picked = pickVariant(nextStreak);
    setCelebration(picked);
    setEmotion("happy");
    // Adaptive window: variant duration + 350ms buffer so particles finish.
    // Capped to a max so even rare 1.4s variants don't make the kid wait too long.
    const windowMs = Math.min(picked.duration * 1000 + 350, 1750);
    setTimeout(() => {
      setShowCorrect(false);
      setEmotion("idle");
      setCelebration(undefined);
      const newOutcome = { ...outcome };
      if (phase === "practice") {
        newOutcome.practiceTotal++;
        if (firstTry) newOutcome.practiceFirstTryCorrect++;
      } else if (phase === "quiz") {
        newOutcome.quizTotal++;
        if (firstTry) newOutcome.quizFirstTryCorrect++;
      }
      setOutcome(newOutcome);
      setWrongCount(0);
      const nextIndex = problemIndex + 1;
      if (nextIndex >= currentList.problems.length) {
        const nextPhase = phaseIndex + 1;
        if (nextPhase >= phases.length) {
          clearState();
          finishLesson(newOutcome);
        } else {
          setPhaseIndex(nextPhase);
          setProblemIndex(0);
          setPhase(phases[nextPhase].phase);
          saveState(nextPhase, 0);
        }
      } else {
        setProblemIndex(nextIndex);
        saveState(phaseIndex, nextIndex);
      }
    }, windowMs);
  };

  const onWrong = () => {
    play("wrong");
    setShakeTrigger((t) => t + 1);
    setEmotion("encouraging");
    setWrongCount((w) => w + 1);
    setStreak(0);
    if (wrongCount + 1 >= 2) setTriggeredStuckHint(true);
    setTimeout(() => setEmotion("idle"), 600);
  };

  const finishLesson = (final: typeof outcome) => {
    const stars = computeStars(final, triggeredStuckHint);
    const passed = didPass(final);
    const newBlob = structuredClone(progress);
    newBlob.lessons[lessonId] = {
      stars,
      firstTryAccuracy:
        (final.practiceFirstTryCorrect + final.quizFirstTryCorrect) /
        (final.practiceTotal + final.quizTotal),
      attempts: (newBlob.lessons[lessonId]?.attempts ?? 0) + 1,
      completedAt: new Date().toISOString(),
    };
    if (!passed)
      newBlob.failedAttemptCounts[lessonId] =
        (newBlob.failedAttemptCounts[lessonId] ?? 0) + 1;
    else delete newBlob.failedAttemptCounts[lessonId];
    if (passed && lesson.unlocks[0])
      newBlob.currentLessonId = lesson.unlocks[0];
    commitProgress(newBlob);
    play("win");
    router.push(`/done?lesson=${lessonId}&stars=${stars}`);
  };

  const submitTap = (v: number) =>
    v === currentProblem.answer ? onCorrect() : onWrong();
  const submitType = (v: number) =>
    v === currentProblem.answer ? onCorrect() : onWrong();

  const renderManipulative = (kind: ManipulativeKind) => {
    const p = currentProblem;
    const manip = (() => {
      switch (kind) {
        case "tens-frame":
          if (lesson.track === "subtraction") {
            return (
              <TensFrame
                filled={p.a}
                secondFilled={0}
                takeAway={p.b}
                mode="fill"
                interactive={false}
                onChange={() => {}}
              />
            );
          }
          return (
            <TensFrame
              filled={p.a}
              secondFilled={p.b}
              mode="fill"
              interactive={false}
              onChange={() => {}}
            />
          );
        case "double-tens-frame":
          if (lesson.track === "subtraction") {
            return (
              <DoubleTensFrame
                leftFilled={Math.min(p.a, 10)}
                rightFilled={Math.max(0, p.a - 10)}
                takeAway={p.b}
                rightColour="orange"
                interactive={false}
                onAdd={() => {}}
              />
            );
          }
          return (
            <DoubleTensFrame
              leftFilled={p.a}
              rightFilled={p.b}
              rightColour="blue"
              interactive={false}
              onAdd={() => {}}
            />
          );
        case "place-value-blocks":
          return (
            <PlaceValueBlocks
              tens={Math.floor(p.a / 10)}
              ones={p.a % 10}
              secondTens={Math.floor(p.b / 10)}
              secondOnes={p.b % 10}
              interactive={false}
              onChange={() => {}}
            />
          );
        case "equal-groups":
          return (
            <EqualGroups
              plates={p.a}
              perPlate={p.b}
              countedPlates={0}
              onCount={() => {}}
            />
          );
        case "array-grid":
          return (
            <ArrayGrid
              rows={p.a}
              cols={p.b}
              rotated={false}
              interactive={false}
              onRotate={() => {}}
            />
          );
        case "number-line": {
          const isSubtraction = lesson.track === "subtraction";
          const isSkipCount = lesson.track === "multiplication";
          if (isSubtraction) {
            return (
              <div className="min-w-[800px]">
                <NumberLine
                  max={20}
                  frogAt={p.a}
                  startAt={p.a}
                  hopCount={p.b}
                  hopSize={1}
                  direction="backward"
                  showHops={true}
                  interactive={false}
                  onHop={() => {}}
                />
              </div>
            );
          }
          if (isSkipCount) {
            return (
              <div className="min-w-[800px]">
                <NumberLine
                  max={p.a * p.b + p.a}
                  frogAt={p.a * p.b}
                  startAt={0}
                  hopCount={p.b}
                  hopSize={p.a}
                  direction="forward"
                  showHops={true}
                  interactive={false}
                  onHop={() => {}}
                />
              </div>
            );
          }
          return (
            <div className="min-w-[800px]">
              <NumberLine
                max={20}
                frogAt={p.a}
                interactive={false}
                onHop={() => {}}
              />
            </div>
          );
        }
        default:
          return null;
      }
    })();

    if (phase === "quiz") {
      return (
        <div className="flex flex-col items-center gap-4">
          <div className="text-lg font-semibold text-ink/60">
            Try to remember!
          </div>
          <div className="opacity-20 pointer-events-none scale-75 origin-top">
            {manip}
          </div>
        </div>
      );
    }
    return manip;
  };

  const tileOptions = useMemo(() => {
    if (currentProblem.inputMode !== "tap") return [];
    const distractors = generateDistractors(
      currentProblem.answer,
      currentProblem.a,
      currentProblem.b,
      `${lessonId}-${currentProblem.id}`,
    );
    return shuffle(
      [currentProblem.answer, ...distractors],
      `${lessonId}-${currentProblem.id}`,
    );
  }, [currentProblem, lessonId]);

  const promptText = (() => {
    if (lesson.track === "multiplication")
      return `What is ${currentProblem.b} × ${currentProblem.a}?`;
    if (phase === "quiz")
      return `${currentProblem.a} ${lesson.track === "subtraction" ? "−" : "+"} ${currentProblem.b} = ?`;
    if (lesson.track === "subtraction") {
      // Match the prompt to what the kid is looking at.
      // Number line: frog hops backward — answer is where it lands.
      // Tens-frame / double-tens-frame: items are crossed out — answer is what remains.
      if (lesson.manipulative === "number-line") {
        return "Where does the frog land?";
      }
      return "How many are left?";
    }
    return "How many altogether?";
  })();

  return (
    <>
      {/* Back-to-home button — top-left, slightly out of the main play area. */}
      <Link
        href="/"
        aria-label="Back to home"
        className="absolute top-3 left-3 z-50 w-14 h-14 rounded-full bg-white border-4 border-ink/80 shadow-[0_3px_0_rgba(0,0,0,0.18)] flex items-center justify-center text-2xl active:scale-95 transition-transform"
        data-testid="lesson-back-home"
      >
        🏠
      </Link>
      <LessonShell
        top={
          // The question banner — designed to be the first thing the kid sees
          // when a problem appears. Re-animates on each new problem so it
          // feels like a fresh prompt rather than static text.
          <motion.div
            key={`prompt-${currentProblem.id}`}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white border-4 border-ink/80 rounded-3xl px-10 py-5 text-5xl font-black text-ink text-center tracking-tight shadow-[0_4px_0_rgba(0,0,0,0.12)] max-w-3xl"
            data-testid="lesson-prompt"
          >
            {promptText}
          </motion.div>
        }
        left={
          <div className="flex flex-col items-center">
            <Mascot
              emotion={emotion}
              character={character}
              variant={celebration}
            />
          </div>
        }
        centre={
          <div className="relative overflow-hidden w-full h-full flex items-center justify-center">
            <GentleShake trigger={shakeTrigger}>
              <motion.div
                key={currentProblem.id}
                initial={{ opacity: 0, scale: 0.92, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {renderManipulative(lesson.manipulative)}
              </motion.div>
            </GentleShake>
            <CorrectBurst show={showCorrect} />
          </div>
        }
        right={
          currentProblem.inputMode === "tap" ? (
            <AnswerTiles
              options={tileOptions}
              seed={currentProblem.id}
              onPick={submitTap}
              disabled={showCorrect}
            />
          ) : (
            <NumberPad onConfirm={submitType} disabled={showCorrect} />
          )
        }
        bottom={
          <ProgressBar
            total={currentList.problems.length}
            filled={problemIndex}
          />
        }
      />
    </>
  );
}

function shuffle<T>(arr: T[], seed: string): T[] {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const rng = () => {
    h = Math.imul(h ^ (h >>> 15), h | 1);
    h ^= h + Math.imul(h ^ (h >>> 7), h | 61);
    return ((h ^ (h >>> 14)) >>> 0) / 4294967296;
  };
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
