"use client";
import { motion } from "framer-motion";
import { play } from "@/lib/sound";

interface Props {
  filled: number;
  onChange: (next: number) => void;
  mode: "fill" | "take-away";
  highlightTo10?: boolean;
}

export function TensFrame({ filled, onChange, mode, highlightTo10 }: Props) {
  const cells = Array.from({ length: 10 }, (_, i) => i < filled);

  const handleTrayClick = () => {
    if (mode !== "fill" || filled >= 10) return;
    play("drop");
    onChange(filled + 1);
  };

  const handleCellClick = (i: number) => {
    if (mode !== "take-away" || !cells[i]) return;
    play("drop");
    onChange(filled - 1);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="grid grid-cols-5 gap-2 p-3 bg-white rounded-2xl border-4 border-ink/80">
        {cells.map((on, i) => {
          const isHintCell = highlightTo10 && !on && i < 10;
          return (
            <button
              key={i}
              data-testid={on ? "tf-cell-filled" : "tf-cell"}
              onClick={() => handleCellClick(i)}
              className={`w-16 h-16 rounded-xl flex items-center justify-center ${isHintCell ? "bg-yellow/30" : "bg-cream"}`}
              style={{ outline: "2px solid var(--ink)" }}
            >
              {on && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  className="w-10 h-10 rounded-full bg-orange"
                />
              )}
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
