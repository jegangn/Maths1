"use client";
import { motion } from "framer-motion";
import { play } from "@/lib/sound";

interface Props {
  plates: number;
  perPlate: number;
  countedPlates: number;
  onCount: (n: number) => void;
}

// Symmetric, easy-to-count layouts per dot count.
// Each entry is an array of row-counts. e.g. 5 → [2, 1, 2] = dice-5 pattern.
// Symmetric layouts are easier for a 5-year-old to count at a glance than
// uneven wrapping.
const LAYOUT_BY_COUNT: Record<number, number[]> = {
  1: [1],
  2: [2],
  3: [3],
  4: [2, 2], // 2x2 grid — what the user asked for
  5: [2, 1, 2], // dice 5
  6: [3, 3], // 2x3 grid
  7: [2, 3, 2], // pyramid
  8: [4, 4],
  9: [3, 3, 3],
  10: [3, 4, 3],
};

export function EqualGroups({
  plates,
  perPlate,
  countedPlates,
  onCount,
}: Props) {
  const rows = LAYOUT_BY_COUNT[perPlate] ?? [perPlate];
  // Slightly smaller dots when there are lots of them, so the layout breathes.
  const dotSize = perPlate <= 6 ? "w-6 h-6" : "w-5 h-5";

  return (
    <div className="flex flex-col items-center justify-center gap-6 h-full">
      <div className="flex gap-6 items-end">
        {Array.from({ length: plates }, (_, p) => {
          const counted = p < countedPlates;
          // Stagger index counts dots row-by-row, left-to-right.
          let dotIndex = 0;
          return (
            <button
              key={p}
              data-testid="eg-plate"
              onClick={() => {
                play("drop");
                onCount(p + 1);
              }}
              className={`relative w-32 h-32 rounded-full border-4 border-ink/80 flex flex-col items-center justify-center gap-1.5 ${counted ? "bg-yellow/40" : "bg-cream"}`}
            >
              {rows.map((rowCount, rowIdx) => (
                <div key={rowIdx} className="flex gap-1.5 justify-center">
                  {Array.from({ length: rowCount }, () => {
                    const i = dotIndex++;
                    return (
                      <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.05, type: "spring" }}
                        data-testid="eg-cookie"
                        className={`${dotSize} rounded-full bg-coral border-2 border-ink/60`}
                      />
                    );
                  })}
                </div>
              ))}
            </button>
          );
        })}
      </div>
    </div>
  );
}
