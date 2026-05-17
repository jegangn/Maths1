"use client";
import Link from "next/link";
import { allLessons } from "@/lessons";
import { useAppStore } from "@/engine/store";
import { Mascot } from "@/components/mascot/Mascot";
import { useEffect } from "react";

export function LessonMap() {
  const { progress, hydrate } = useAppStore();
  useEffect(() => {
    hydrate();
  }, [hydrate]);
  const lessons = Object.values(allLessons);
  return (
    <div className="h-screen w-screen p-6 overflow-x-auto bg-cream">
      <div className="flex items-center gap-8 h-full min-w-max">
        {lessons.map((lesson) => {
          const record = progress.lessons[lesson.id];
          const isCurrent = lesson.id === progress.currentLessonId;
          const isCompleted = !!record;
          const trackColour =
            lesson.track === "addition"
              ? "bg-yellow"
              : lesson.track === "subtraction"
                ? "bg-blue"
                : "bg-coral";
          return (
            <Link
              key={lesson.id}
              href={`/lesson/${lesson.id}`}
              className="flex flex-col items-center gap-2"
            >
              {isCurrent && <Mascot emotion="idle" />}
              <div
                className={`w-32 h-32 rounded-full border-4 border-ink/80 flex items-center justify-center text-2xl ${trackColour} ${!isCompleted && !isCurrent ? "opacity-40" : ""}`}
              >
                {isCompleted ? "⭐".repeat(record.stars) : ""}
              </div>
              <div className="text-sm font-medium">{lesson.title}</div>
            </Link>
          );
        })}
      </div>
      <div className="absolute bottom-4 right-4 text-xs text-ink/40">
        v1.0.0
      </div>
    </div>
  );
}
