"use client";
import { useEffect, useMemo, useState } from "react";
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
import { TensFrame } from "@/components/manipulatives/TensFrame";
import { DoubleTensFrame } from "@/components/manipulatives/DoubleTensFrame";
import { PlaceValueBlocks } from "@/components/manipulatives/PlaceValueBlocks";
import { EqualGroups } from "@/components/manipulatives/EqualGroups";
import { ArrayGrid } from "@/components/manipulatives/ArrayGrid";
import { NumberLine } from "@/components/manipulatives/NumberLine";
import { NumberBond } from "@/components/manipulatives/NumberBond";
import { AnswerTiles } from "@/components/input/AnswerTiles";
import { NumberPad } from "@/components/input/NumberPad";
import { ProgressBar } from "./ProgressBar";
import { CorrectBurst, GentleShake } from "@/components/feedback/Feedback";
import { play } from "@/lib/sound";

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

  const phases: PhaseList[] = useMemo(() => {
    if (!lesson) return [];
    const intro: Problem[] = lesson.intro.map((p, i) => ({
      id: `i-${i}`,
      a: p.a,
      b: p.b,
      answer: p.a + p.b,
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

  if (!lesson) return <div className="p-8">Lesson not found.</div>;

  const currentList = phases[phaseIndex];
  const currentProblem = currentList?.problems[problemIndex];
  if (!currentProblem) return <div className="p-8">Loading…</div>;

  const onCorrect = () => {
    play("correct");
    setShowCorrect(true);
    setEmotion("happy");
    setTimeout(() => {
      setShowCorrect(false);
      setEmotion("idle");
      const firstTry = wrongCount === 0;
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
        if (nextPhase >= phases.length) finishLesson(newOutcome);
        else {
          setPhaseIndex(nextPhase);
          setProblemIndex(0);
          setPhase(phases[nextPhase].phase);
        }
      } else setProblemIndex(nextIndex);
    }, 700);
  };

  const onWrong = () => {
    play("wrong");
    setShakeTrigger((t) => t + 1);
    setEmotion("encouraging");
    setWrongCount((w) => w + 1);
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
    switch (kind) {
      case "tens-frame":
        return <TensFrame filled={p.a} mode="fill" onChange={() => {}} />;
      case "double-tens-frame":
        return (
          <DoubleTensFrame leftFilled={p.a} rightFilled={0} onAdd={() => {}} />
        );
      case "place-value-blocks":
        return (
          <PlaceValueBlocks
            tens={Math.floor(p.a / 10)}
            ones={p.a % 10}
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
            onRotate={() => {}}
          />
        );
      case "number-line":
        return <NumberLine max={20} frogAt={p.a} onHop={() => {}} />;
      case "number-bond":
        return (
          <NumberBond
            whole={p.a + p.b}
            partA={p.a}
            partB={null}
            onSet={() => {}}
          />
        );
      default:
        return null;
    }
  };

  const tileOptions = useMemo(() => {
    if (currentProblem.inputMode !== "tap") return [];
    const distractors = generateDistractors(
      currentProblem.answer,
      `${lessonId}-${currentProblem.id}`,
    );
    return shuffle(
      [currentProblem.answer, ...distractors],
      `${lessonId}-${currentProblem.id}`,
    );
  }, [currentProblem, lessonId]);

  return (
    <LessonShell
      left={
        <div className="flex flex-col items-center gap-4">
          <Mascot emotion={emotion} />
          <div className="bg-white border-4 border-ink/80 rounded-2xl p-4 text-2xl font-bold text-center">
            {lesson.track === "multiplication"
              ? `What is ${currentProblem.a} × ${currentProblem.b}?`
              : phase === "quiz"
                ? `${currentProblem.a} ${lesson.track === "subtraction" ? "−" : "+"} ${currentProblem.b} = ?`
                : `How many altogether?`}
          </div>
        </div>
      }
      centre={
        <div className="relative">
          <GentleShake trigger={shakeTrigger}>
            {renderManipulative(lesson.manipulative)}
          </GentleShake>
          <CorrectBurst show={showCorrect} />
        </div>
      }
      right={
        currentProblem.inputMode === "tap" ? (
          <AnswerTiles
            options={tileOptions}
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
