"use client";
import type { ReactNode } from "react";

interface Props {
  left: ReactNode;
  centre: ReactNode;
  right: ReactNode;
  bottom: ReactNode;
}

export function LessonShell({ left, centre, right, bottom }: Props) {
  return (
    <div className="h-screen w-screen flex flex-col bg-cream">
      <div className="flex-1 grid grid-cols-[22fr_56fr_22fr] gap-6 p-6">
        <div className="flex flex-col items-center justify-end">{left}</div>
        <div className="flex items-center justify-center">{centre}</div>
        <div className="flex items-center justify-center">{right}</div>
      </div>
      <div className="h-16 px-6 flex items-center">{bottom}</div>
    </div>
  );
}
