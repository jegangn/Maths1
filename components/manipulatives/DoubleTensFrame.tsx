"use client";
import { play } from "@/lib/sound";

interface Props {
  leftFilled: number;
  rightFilled: number;
  onAdd: (next: { left: number; right: number }) => void;
}

function Frame({ filled, prefix }: { filled: number; prefix: string }) {
  const cells = Array.from({ length: 10 }, (_, i) => i < filled);
  return (
    <div className="grid grid-cols-5 gap-2 p-3 bg-white rounded-2xl border-4 border-ink/80">
      {cells.map((on, i) => (
        <div
          key={i}
          data-testid={`dtf-cell-${prefix}-${on ? "filled" : "empty"}`}
          className="w-14 h-14 rounded-xl flex items-center justify-center bg-cream"
          style={{ outline: "2px solid var(--ink)" }}
        >
          {on && <div className="w-9 h-9 rounded-full bg-orange" />}
        </div>
      ))}
    </div>
  );
}

export function DoubleTensFrame({ leftFilled, rightFilled, onAdd }: Props) {
  const handleAdd = () => {
    play("drop");
    if (leftFilled < 10) onAdd({ left: leftFilled + 1, right: rightFilled });
    else onAdd({ left: leftFilled, right: rightFilled + 1 });
  };
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-6">
        <Frame filled={leftFilled} prefix="L" />
        <Frame filled={rightFilled} prefix="R" />
      </div>
      <button
        data-testid="dtf-tray-dot"
        onClick={handleAdd}
        className="w-16 h-16 rounded-full bg-orange border-4 border-ink/80 active:scale-95 transition-transform"
      />
    </div>
  );
}
