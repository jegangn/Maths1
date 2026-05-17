"use client";
import { play } from "@/lib/sound";

interface Props {
  filled: number;
  /** Optional second group to show in a different colour (blue). Used for
   * static-visualisation mode: first `filled` dots are orange, next
   * `secondFilled` dots are blue, so kids see both addends at once. */
  secondFilled?: number;
  onChange: (next: number) => void;
  mode: "fill" | "take-away";
  highlightTo10?: boolean;
}

export function TensFrame({
  filled,
  secondFilled = 0,
  onChange,
  mode,
  highlightTo10,
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
    <div className="flex flex-col items-center gap-6">
      <div className="grid grid-cols-5 gap-2 p-3 bg-white rounded-2xl border-4 border-ink/80">
        {Array.from({ length: 10 }, (_, i) => {
          const isFirst = i < filled;
          const isSecond = !isFirst && i < total;
          const isOn = isFirst || isSecond;
          const isHintCell = highlightTo10 && !isOn && i < 10;
          return (
            <button
              key={i}
              data-testid={isOn ? "tf-cell-filled" : "tf-cell"}
              onClick={() => handleCellClick(i)}
              className={`w-16 h-16 rounded-xl flex items-center justify-center ${isHintCell ? "bg-yellow/30" : "bg-cream"}`}
              style={{ outline: "2px solid var(--ink)" }}
            >
              {isFirst && <div className="w-10 h-10 rounded-full bg-orange" />}
              {isSecond && <div className="w-10 h-10 rounded-full bg-blue" />}
            </button>
          );
        })}
      </div>
      {mode === "fill" && (
        <button
          data-testid="tf-tray-dot"
          onClick={handleTrayClick}
          className="w-16 h-16 rounded-full bg-orange border-4 border-ink/80 active:scale-95 transition-transform"
        />
      )}
    </div>
  );
}
