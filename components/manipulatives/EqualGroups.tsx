"use client";
import { motion } from "framer-motion";
import { play } from "@/lib/sound";

interface Props {
  plates: number;
  perPlate: number;
  countedPlates: number;
  onCount: (n: number) => void;
}

export function EqualGroups({
  plates,
  perPlate,
  countedPlates,
  onCount,
}: Props) {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-6 items-end">
        {Array.from({ length: plates }, (_, p) => {
          const counted = p < countedPlates;
          return (
            <button
              key={p}
              data-testid="eg-plate"
              onClick={() => {
                play("drop");
                onCount(p + 1);
              }}
              className={`relative w-32 h-32 rounded-full border-4 border-ink/80 flex flex-wrap p-2 gap-1 items-center justify-center ${counted ? "bg-yellow/40" : "bg-cream"}`}
            >
              {Array.from({ length: perPlate }, (_, c) => (
                <motion.div
                  key={c}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: c * 0.05, type: "spring" }}
                  data-testid="eg-cookie"
                  className="w-6 h-6 rounded-full bg-coral border-2 border-ink/60"
                />
              ))}
            </button>
          );
        })}
      </div>
      <div className="text-2xl font-bold">
        Counted: {countedPlates * perPlate}
      </div>
    </div>
  );
}
