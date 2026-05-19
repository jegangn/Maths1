"use client";
import type { ReactNode } from "react";

interface Props {
  /** Banner slot above the play area — typically the question prompt.
   * Optional so other screens can still use this shell without one. */
  top?: ReactNode;
  left: ReactNode;
  centre: ReactNode;
  right: ReactNode;
  bottom: ReactNode;
}

export function LessonShell({ top, left, centre, right, bottom }: Props) {
  return (
    <div className="h-screen w-screen flex flex-col bg-cream">
      {top && (
        <div className="flex-shrink-0 flex justify-center px-6 pt-4 pb-1">
          {top}
        </div>
      )}
      <div className="flex-1 grid grid-cols-[22fr_56fr_22fr] gap-6 px-6 pt-2 pb-6 min-h-0">
        <div className="flex flex-col items-center justify-end">{left}</div>
        <div className="flex items-center justify-center overflow-hidden">
          {centre}
        </div>
        <div className="flex items-center justify-center">{right}</div>
      </div>
      <div className="h-16 px-6 flex items-center">{bottom}</div>
    </div>
  );
}
