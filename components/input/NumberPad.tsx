"use client";
import { useState } from "react";
import { play } from "@/lib/sound";

interface Props {
  onConfirm: (value: number) => void;
  disabled: boolean;
}

export function NumberPad({ onConfirm, disabled }: Props) {
  const [buf, setBuf] = useState("");
  const tapDigit = (d: number) => {
    if (disabled || buf.length >= 3) return;
    play("tap");
    setBuf(buf + d);
  };
  const confirm = () => {
    if (disabled || !buf) return;
    // Heavier "drop" sound so confirm feels meaningfully different from a
    // digit press. The correct/wrong sound from the parent fires right after.
    play("drop");
    onConfirm(parseInt(buf, 10));
    setBuf("");
  };
  const clear = () => {
    play("tap");
    setBuf("");
  };
  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="text-5xl font-bold bg-white rounded-2xl border-4 border-ink/80 p-4 text-center min-h-[72px]">
        {buf || " "}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
          <button
            key={d}
            data-testid={`np-${d}`}
            disabled={disabled}
            onClick={() => tapDigit(d)}
            className="py-4 text-2xl font-bold bg-white rounded-xl border-2 border-ink/80"
          >
            {d}
          </button>
        ))}
        <button
          onClick={clear}
          className="py-4 text-lg bg-coral/30 rounded-xl border-2 border-ink/80"
        >
          Clear
        </button>
        <button
          data-testid="np-0"
          disabled={disabled}
          onClick={() => tapDigit(0)}
          className="py-4 text-2xl font-bold bg-white rounded-xl border-2 border-ink/80"
        >
          0
        </button>
        <button
          data-testid="np-confirm"
          disabled={disabled}
          onClick={confirm}
          className="py-4 text-lg font-bold bg-yellow rounded-xl border-2 border-ink/80"
        >
          ✓
        </button>
      </div>
    </div>
  );
}
