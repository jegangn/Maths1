"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { allLessons } from "@/lessons";
import { useAppStore } from "@/engine/store";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Track, Lesson } from "@/lib/types";

type TrackMeta = {
  label: string;
  icon: string;
  bg: string;
  fill: string;
  borderColour: string;
  pathColour: string;
};

const TRACK_META: Record<Track, TrackMeta> = {
  addition: {
    label: "Adding",
    icon: "+",
    bg: "bg-yellow/20",
    fill: "bg-yellow",
    borderColour: "border-yellow",
    pathColour: "bg-yellow/50",
  },
  subtraction: {
    label: "Subtracting",
    icon: "−",
    bg: "bg-blue/20",
    fill: "bg-blue",
    borderColour: "border-blue",
    pathColour: "bg-blue/50",
  },
  multiplication: {
    label: "Multiplying",
    icon: "×",
    bg: "bg-coral/20",
    fill: "bg-coral",
    borderColour: "border-coral",
    pathColour: "bg-coral/50",
  },
};

const TRACK_ORDER: Track[] = ["addition", "subtraction", "multiplication"];

const MASCOT_W = 180;
const MASCOT_H = 180;
const DOT_PX = 56;
// Vertical offset of mascot top relative to dot center.
// Mascot bottom should slightly overlap the dot's top.
const MASCOT_Y_OFFSET = MASCOT_H + DOT_PX / 2 - 12; // 196px above dot centre

export function LessonMap() {
  const router = useRouter();
  const { progress, hydrate } = useAppStore();
  const [tapCount, setTapCount] = useState(0);
  const [targetLessonId, setTargetLessonId] = useState<string | null>(null);
  const [mascotPos, setMascotPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const dotRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const navigationLock = useRef(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Initialize / sync target with the user's actual current lesson.
  useEffect(() => {
    if (progress.currentLessonId) {
      setTargetLessonId(progress.currentLessonId);
    }
  }, [progress.currentLessonId]);

  // Measure the target dot's screen position whenever the target changes.
  useLayoutEffect(() => {
    if (!targetLessonId) return;
    const el = dotRefs.current[targetLessonId];
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setMascotPos({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
  }, [targetLessonId]);

  // Re-measure on window resize so the mascot stays anchored.
  useEffect(() => {
    const handler = () => {
      if (!targetLessonId) return;
      const el = dotRefs.current[targetLessonId];
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setMascotPos({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [targetLessonId]);

  const handleDotClick =
    (lessonId: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      if (navigationLock.current) return;
      // Already there → navigate immediately.
      if (lessonId === targetLessonId) {
        navigationLock.current = true;
        router.push(`/lesson/${lessonId}`);
        return;
      }
      // Otherwise, hop the mascot over first, then navigate.
      navigationLock.current = true;
      setTargetLessonId(lessonId);
      window.setTimeout(() => {
        router.push(`/lesson/${lessonId}`);
      }, 700);
    };

  const handleVersionTap = () => {
    const next = tapCount + 1;
    setTapCount(next);
    if (next >= 5) router.push("/parent");
    setTimeout(() => setTapCount(0), 3000);
  };

  const lessonsByTrack = useMemo(() => {
    const result: Record<Track, Lesson[]> = {
      addition: [],
      subtraction: [],
      multiplication: [],
    };
    Object.values(allLessons).forEach((l) => result[l.track].push(l));
    return result;
  }, []);

  const totalStars = useMemo(
    () => Object.values(progress.lessons).reduce((acc, l) => acc + l.stars, 0),
    [progress],
  );
  const maxStars = Object.keys(allLessons).length * 3;

  return (
    <div className="relative h-screen w-screen bg-cream flex flex-col p-4 gap-3 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-2 flex-shrink-0">
        <h1 className="text-4xl font-black text-ink tracking-tight leading-none">
          Math Adventure
        </h1>
        <div className="flex items-center gap-2 bg-white border-4 border-ink/80 rounded-2xl px-4 py-2 shadow-[0_3px_0_rgba(0,0,0,0.12)]">
          <span className="text-2xl leading-none">⭐</span>
          <span className="text-xl font-black text-ink leading-none">
            {totalStars} / {maxStars}
          </span>
        </div>
      </header>

      {/* Three lanes, all visible on one page */}
      <div className="flex-1 flex flex-col gap-3 min-h-0">
        {TRACK_ORDER.map((track, laneIndex) => {
          const meta = TRACK_META[track];
          const lessons = lessonsByTrack[track];
          const completed = lessons.filter(
            (l) => progress.lessons[l.id],
          ).length;
          return (
            <motion.div
              key={track}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: laneIndex * 0.08, duration: 0.4 }}
              className={`flex-1 grid grid-cols-[11rem_1fr] items-center gap-5 px-5 rounded-3xl border-4 border-ink/80 ${meta.bg} min-h-0 shadow-[0_4px_0_rgba(0,0,0,0.1)] overflow-visible`}
              data-testid={`lane-${track}`}
            >
              {/* Track Header — horizontal so the icon sits at lane vertical centre */}
              <div className="flex items-center gap-3 flex-shrink-0 w-44">
                <div
                  className={`w-14 h-14 rounded-2xl border-4 border-ink/80 ${meta.fill} shadow-[0_3px_0_rgba(0,0,0,0.15)] grid place-items-center`}
                  aria-hidden
                >
                  <span className="text-4xl font-black leading-none">
                    {meta.icon}
                  </span>
                </div>
                <div className="flex flex-col items-start leading-tight">
                  <div className="text-base font-black text-ink">
                    {meta.label}
                  </div>
                  <div className="text-sm font-bold text-ink/70 mt-1">
                    {completed} / {lessons.length}
                  </div>
                </div>
              </div>

              {/* Dots row with sequence path */}
              <div className="relative flex items-center justify-center gap-3 h-full">
                <div
                  className={`absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 ${meta.pathColour} rounded-full pointer-events-none`}
                  aria-hidden
                />
                {lessons.map((lesson) => {
                  const record = progress.lessons[lesson.id];
                  const isTarget = lesson.id === targetLessonId;
                  const isCompleted = !!record;
                  const dotClass = isTarget
                    ? `${meta.fill} border-ink/80 shadow-[0_4px_0_rgba(0,0,0,0.22)] scale-125 ring-4 ring-ink/45`
                    : isCompleted
                      ? `${meta.fill} border-ink/80 shadow-[0_2px_0_rgba(0,0,0,0.12)]`
                      : `bg-white ${meta.borderColour} opacity-55`;
                  return (
                    <Link
                      key={lesson.id}
                      ref={(el) => {
                        dotRefs.current[lesson.id] = el;
                      }}
                      href={`/lesson/${lesson.id}`}
                      onClick={handleDotClick(lesson.id)}
                      className="relative flex flex-col items-center flex-shrink-0 z-10"
                      data-testid={`lesson-link-${lesson.id}`}
                      aria-label={lesson.title}
                      title={lesson.title}
                    >
                      <motion.div
                        whileTap={{ scale: 0.92 }}
                        className={`w-14 h-14 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${dotClass}`}
                      >
                        {isCompleted && !isTarget && (
                          <svg
                            viewBox="0 0 24 24"
                            className="w-6 h-6"
                            aria-hidden
                          >
                            <path
                              d="M12 2l2.93 6.94L22 10l-5.5 4.77L18 22l-6-3.6L6 22l1.5-7.23L2 10l7.07-1.06z"
                              fill="white"
                              stroke="rgba(0,0,0,0.4)"
                              strokeWidth="1.5"
                            />
                          </svg>
                        )}
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* The roaming mascot. Outer motion handles position (springs between
          dots). Inner motion gives it a continuous breathing/sway so it never
          looks frozen between hops. */}
      {mascotPos && (
        <motion.div
          className="absolute z-40 pointer-events-none"
          style={{ left: 0, top: 0 }}
          initial={false}
          animate={{
            x: mascotPos.x - MASCOT_W / 2,
            y: mascotPos.y - MASCOT_Y_OFFSET,
          }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 24,
            mass: 1,
          }}
        >
          <motion.img
            src="/mascots/cat-idle.svg"
            alt="You are here"
            className="block max-w-none drop-shadow-[0_8px_8px_rgba(0,0,0,0.22)]"
            style={{ width: MASCOT_W, height: MASCOT_H }}
            animate={{
              y: [0, -6, 0, -4, 0],
              scaleY: [1, 1.025, 1, 1.015, 1],
              scaleX: [1, 0.985, 1, 0.992, 1],
              rotate: [0, 1, 0, -1, 0],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      )}

      <button
        onClick={handleVersionTap}
        className="absolute bottom-2 right-3 text-xs text-ink/30"
        aria-label="version"
      >
        v1.4.0
      </button>
    </div>
  );
}
