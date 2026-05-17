"use client";
import { motion } from "framer-motion";
import { play } from "@/lib/sound";

interface Props {
  options: number[];
  onPick: (v: number) => void;
  disabled: boolean;
}

export function AnswerTiles({ options, onPick, disabled }: Props) {
  return (
    <div className="flex flex-col gap-4 w-full">
      {options.map((v, i) => (
        <motion.button
          key={`${v}-${i}`}
          data-testid="at-tile"
          disabled={disabled}
          onClick={() => {
            play("tap");
            onPick(v);
          }}
          whileTap={{ scale: 0.95 }}
          className="w-full py-6 text-4xl font-bold bg-white rounded-2xl border-4 border-ink/80 disabled:opacity-50"
        >
          {v}
        </motion.button>
      ))}
    </div>
  );
}
