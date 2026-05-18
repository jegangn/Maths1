"use client";
import { play } from "@/lib/sound";

interface Props {
  filled: number;
  /** Optional second group to show in a different colour (blue). Used for
   * static-visualisation mode: first `filled` dots are orange, next
   * `secondFilled` dots are blue, so kids see both addends at once. */
  secondFilled?: number;
  /** For subtraction visualisation: mark the last `takeAway` filled cells
   * with low opacity and a diagonal strikethrough so kids see them removed. */
  takeAway?: number;
  onChange: (next: number) => void;
  mode: "fill" | "take-away";
  highlightTo10?: boolean;
  interactive?: boolean;
}

export function TensFrame({
  filled,
  secondFilled = 0,
  takeAway = 0,
  onChange,
  mode,
  highlightTo10,
  interactive = true,
}: Props) {
  const total = filled + secondFilled;

  const handleTrayClick = () => {
    if (mode !== "fill" || filled >= 10) return;
    play("drop");
    onChange(filled + 1);
  };

  const handleCellClick = (i: number) => {
    if (mode !== "take-away" || i >= filled) return;
    play("drop");
    onChange(filled - 1);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 h-full">
      <div className="grid grid-cols-5 gap-2 p-3 bg-white rounded-2xl border-4 border-ink/80">
        {Array.from({ length: 10 }, (_, i) => {
          const isFirst = i < filled;
          const isSecond = !isFirst && i < total;
          const isOn = isFirst || isSecond;
          const isHintCell = highlightTo10 && !isOn && i < 10;
          // takeAway: the LAST `takeAway` of the filled cells get the struck-out treatment
          const isTakenAway =
            takeAway > 0 && i >= filled - takeAway && i < filled;
          return (
            <button
              key={i}
              data-testid={
                isFirst
                  ? "tf-cell-filled-a"
                  : isSecond
                    ? "tf-cell-filled-b"
                    : "tf-cell"
              }
              onClick={() => handleCellClick(i)}
              className={`w-16 h-16 rounded-xl flex items-center justify-center ${isHintCell ? "bg-yellow/30" : "bg-cream"}`}
              style={{ outline: "2px solid var(--ink)" }}
            >
              {isFirst && (
                <div
                  className={`relative w-10 h-10 rounded-full bg-orange ${isTakenAway ? "opacity-30" : ""}`}
                >
                  {isTakenAway && (
                    <svg
                      className="absolute inset-0 w-full h-full"
                      viewBox="0 0 40 40"
                      aria-hidden="true"
                    >
                      <line
                        x1="4"
                        y1="4"
                        x2="36"
                        y2="36"
                        stroke="black"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </div>
              )}
              {isSecond && <div className="w-10 h-10 rounded-full bg-blue" />}
            </button>
          );
        })}
      </div>
      {interactive && mode === "fill" && (
        <button
          data-testid="tf-tray-dot"
          onClick={handleTrayClick}
          className="w-16 h-16 rounded-full bg-orange border-4 border-ink/80 active:scale-95 transition-transform"
        />
      )}
    </div>
  );
}
