"use client";
import { motion } from "framer-motion";
import { play } from "@/lib/sound";

interface Props {
  max: number;
  frogAt: number;
  step?: number;
  onHop: (next: number) => void;
  // Hop visualisation
  startAt?: number;
  hopCount?: number;
  hopSize?: number;
  direction?: "forward" | "backward";
  showHops?: boolean;
}

export function NumberLine({
  max,
  frogAt,
  step = 1,
  onHop,
  startAt,
  hopCount = 0,
  hopSize = 1,
  direction = "forward",
  showHops = false,
}: Props) {
  const ticks = Array.from({ length: max + 1 }, (_, i) => i);
  const tickPercent = (i: number) => (i / max) * 100;
  const labelClass = max <= 10 ? "text-xl" : "text-base";

  // Build hop arc segments
  const hopArcs: { from: number; to: number }[] = [];
  if (showHops && hopCount > 0 && startAt !== undefined) {
    for (let i = 0; i < hopCount; i++) {
      const from =
        direction === "backward"
          ? startAt - i * hopSize
          : startAt + i * hopSize;
      const to = direction === "backward" ? from - hopSize : from + hopSize;
      if (from >= 0 && from <= max && to >= 0 && to <= max) {
        hopArcs.push({ from, to });
      }
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div
        className="relative w-full"
        style={{ minHeight: "8rem", height: "8rem" }}
      >
        {/* Hop arcs rendered above the line */}
        {hopArcs.length > 0 && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            preserveAspectRatio="none"
            viewBox="0 0 100 32"
            data-testid="nl-hop-arcs-container"
          >
            {hopArcs.map(({ from, to }, i) => {
              const x1 = tickPercent(from);
              const x2 = tickPercent(to);
              const mid = (x1 + x2) / 2;
              // Arc peaks at y=2 (top), endpoints at y=16 (mid-line)
              const arrowX = x2;
              const arrowDir = direction === "backward" ? -1 : 1;
              return (
                <g key={i} data-testid="nl-hop-arc">
                  <path
                    d={`M ${x1},16 Q ${mid},3 ${x2},16`}
                    stroke="#E8836A"
                    strokeWidth="0.7"
                    fill="none"
                    strokeLinecap="round"
                  />
                  {/* Arrowhead pointing toward `to` */}
                  <polygon
                    points={`${arrowX},16 ${arrowX - arrowDir * 1.2},13 ${arrowX - arrowDir * 1.2},19`}
                    fill="#E8836A"
                  />
                </g>
              );
            })}
          </svg>
        )}

        {/* Number line rule */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-ink/70 -translate-y-1/2" />

        {/* Ticks and labels */}
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

        {/* Frog */}
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
