"use client";
import { motion } from "framer-motion";

interface Props {
  rows: number;
  cols: number;
  rotated: boolean;
  onRotate: () => void;
}

export function ArrayGrid({ rows, cols, rotated, onRotate }: Props) {
  const r = rotated ? cols : rows;
  const c = rotated ? rows : cols;
  return (
    <div className="flex flex-col items-center justify-center gap-6 h-full">
      <motion.div
        animate={{ rotate: rotated ? 90 : 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="grid gap-3 p-4 bg-white rounded-2xl border-4 border-ink/80"
        style={{ gridTemplateColumns: `repeat(${c}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: r * c }, (_, i) => (
          <div
            key={i}
            data-testid="ag-dot"
            className="w-10 h-10 rounded-full bg-orange border-2 border-ink/60"
          />
        ))}
      </motion.div>
      <button
        data-testid="ag-rotate"
        onClick={onRotate}
        className="px-5 py-3 bg-blue rounded-xl border-2 border-ink/80"
      >
        Rotate
      </button>
    </div>
  );
}
