"use client";
import { motion } from "framer-motion";
import { play } from "@/lib/sound";

interface Props {
  max: number;
  frogAt: number;
  step?: number;
  onHop: (next: number) => void;
}

export function NumberLine({ max, frogAt, step = 1, onHop }: Props) {
  const ticks = Array.from({ length: max + 1 }, (_, i) => i);
  const tickPercent = (i: number) => (i / max) * 100;
  const labelClass = max <= 10 ? "text-xl" : "text-base";
  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="relative w-full min-h-32 h-32">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-ink/70 -translate-y-1/2" />
        {ticks.map((t) => (
          <div
            key={t}
            data-testid="nl-tick"
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center"
            style={{ left: `${tickPercent(t)}%` }}
          >
            <div className="w-1 h-4 bg-ink/70" />
            <div className={`${labelClass} mt-1`}>{t}</div>
          </div>
        ))}
        <motion.div
          animate={{ left: `${tickPercent(frogAt)}%` }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          className="absolute top-0 -translate-x-1/2 text-3xl"
        >
          🐸
        </motion.div>
      </div>
      <div className="flex gap-4">
        <button
          data-testid="nl-hop-left"
          onClick={() => {
            play("drop");
            onHop(Math.max(0, frogAt - step));
          }}
          className="px-5 py-3 bg-blue rounded-xl border-2 border-ink/80"
        >
          ← Hop
        </button>
        <button
          data-testid="nl-hop-right"
          onClick={() => {
            play("drop");
            onHop(Math.min(max, frogAt + step));
          }}
          className="px-5 py-3 bg-blue rounded-xl border-2 border-ink/80"
        >
          Hop →
        </button>
      </div>
    </div>
  );
}
