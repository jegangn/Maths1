"use client";
import { motion } from "framer-motion";
import { play } from "@/lib/sound";

interface Props {
  options: number[];
  /** Seed (typically the problem id) for keying — tiles re-stagger on problem change. */
  seed?: string;
  onPick: (v: number) => void;
  disabled: boolean;
}

export function AnswerTiles({ options, seed = "", onPick, disabled }: Props) {
  return (
    <div className="flex flex-col gap-4 w-full">
      {options.map((v, i) => (
        <motion.button
          key={`${seed}-${v}-${i}`}
          data-testid="at-tile"
          disabled={disabled}
          onClick={() => {
            play("tap");
            onPick(v);
          }}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{
            delay: i * 0.07,
            duration: 0.35,
            ease: [0.16, 1, 0.3, 1], // ease-out-quart — fast then settles
          }}
          whileTap={{ scale: 0.92, transition: { duration: 0.08 } }}
          className="w-full py-6 text-4xl font-bold bg-white rounded-2xl border-4 border-ink/80 disabled:opacity-50 transition-shadow shadow-[0_3px_0_rgba(0,0,0,0.12)] active:shadow-[0_1px_0_rgba(0,0,0,0.08)] active:translate-y-0.5"
        >
          {v}
        </motion.button>
      ))}
    </div>
  );
}
