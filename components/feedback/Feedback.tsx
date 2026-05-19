"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";

// =====================================================================
// CORRECT-ANSWER BURST — 5 randomized variants for the centre zone.
// One fires each time the kid gets a correct answer.
// =====================================================================

const BURST_COLORS = ["#F4C95D", "#E8836A", "#7FB3D5", "#86C775", "#E8923C"];

type BurstVariant = "sunburst" | "confetti" | "starburst" | "rings" | "bubbles";

const VARIANTS: BurstVariant[] = [
  "sunburst",
  "confetti",
  "starburst",
  "rings",
  "bubbles",
];

export function CorrectBurst({ show }: { show: boolean }) {
  // Pick a new variant each time the burst fires; avoid repeating the previous one.
  const lastVariant = useRef<BurstVariant | null>(null);
  const variant = useMemo<BurstVariant>(() => {
    if (!show) return lastVariant.current ?? VARIANTS[0];
    const pool = VARIANTS.filter((v) => v !== lastVariant.current);
    const picked = pool[Math.floor(Math.random() * pool.length)];
    lastVariant.current = picked;
    return picked;
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden"
        >
          {variant === "sunburst" && <Sunburst />}
          {variant === "confetti" && <Confetti />}
          {variant === "starburst" && <Starburst />}
          {variant === "rings" && <Rings />}
          {variant === "bubbles" && <Bubbles />}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---------- Variant 1: Sunburst rays ---------------------------------
function Sunburst() {
  const rays = Array.from({ length: 12 }, (_, i) => i * 30);
  return (
    <motion.div
      initial={{ scale: 0, rotate: -20 }}
      animate={{
        scale: [0, 1.15, 1],
        rotate: [-20, 10, 25],
        opacity: [1, 1, 0],
      }}
      transition={{ duration: 0.85, times: [0, 0.4, 1], ease: "easeOut" }}
      className="relative"
    >
      <svg width="500" height="500" viewBox="-250 -250 500 500" aria-hidden>
        {rays.map((angle) => (
          <line
            key={angle}
            x1="0"
            y1="-50"
            x2="0"
            y2="-220"
            stroke="#F4C95D"
            strokeWidth="16"
            strokeLinecap="round"
            transform={`rotate(${angle})`}
            opacity="0.85"
          />
        ))}
        <circle cx="0" cy="0" r="60" fill="#F4C95D" opacity="0.9" />
        <circle cx="0" cy="0" r="45" fill="#E8923C" opacity="0.7" />
      </svg>
    </motion.div>
  );
}

// ---------- Variant 2: Confetti rain ---------------------------------
function Confetti() {
  // Deterministic-on-mount pseudo-randomness so SSR doesn't trip
  const pieces = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        x: -260 + Math.random() * 520,
        endX: -340 + Math.random() * 680,
        delay: Math.random() * 0.25,
        rotateEnd: (Math.random() - 0.5) * 1440,
        color: BURST_COLORS[i % BURST_COLORS.length],
        shape: i % 3, // 0=rect, 1=circle, 2=triangle
        w: 8 + Math.random() * 8,
        h: 10 + Math.random() * 12,
      })),
    [],
  );
  return (
    <div className="relative w-full h-full">
      {pieces.map((p, i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-1/2"
          style={{
            width: p.w,
            height: p.h,
            background: p.shape === 2 ? "transparent" : p.color,
            borderRadius: p.shape === 1 ? "50%" : 4,
            // Triangle via CSS clip-path when shape === 2
            clipPath:
              p.shape === 2 ? "polygon(50% 0, 100% 100%, 0 100%)" : undefined,
            backgroundColor: p.shape === 2 ? p.color : undefined,
          }}
          initial={{ x: p.x, y: -340, rotate: 0, opacity: 0 }}
          animate={{
            x: p.endX,
            y: 360,
            rotate: p.rotateEnd,
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 1.05,
            delay: p.delay,
            times: [0, 0.1, 0.8, 1],
            ease: [0.32, 0, 0.67, 0], // ease-in-quad — falls faster like gravity
          }}
        />
      ))}
    </div>
  );
}

// ---------- Variant 3: Starburst ------------------------------------
function Starburst() {
  const stars = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const angle = (i / 14) * Math.PI * 2 + Math.random() * 0.2;
        const r = 180 + Math.random() * 80;
        return {
          x: Math.cos(angle) * r,
          y: Math.sin(angle) * r,
          delay: (i % 4) * 0.04,
          emoji: i % 3 === 0 ? "🌟" : i % 3 === 1 ? "⭐" : "✨",
          size: 36 + Math.random() * 18,
        };
      }),
    [],
  );
  return (
    <div className="relative">
      {stars.map((s, i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-1/2 select-none"
          style={{
            fontSize: s.size,
            marginLeft: -s.size / 2,
            marginTop: -s.size / 2,
          }}
          initial={{ x: 0, y: 0, scale: 0, opacity: 0, rotate: 0 }}
          animate={{
            x: [0, s.x * 0.6, s.x],
            y: [0, s.y * 0.6, s.y],
            scale: [0, 1.6, 1.1, 0.4],
            opacity: [0, 1, 1, 0],
            rotate: [0, 240, 480],
          }}
          transition={{
            duration: 0.9,
            delay: s.delay,
            times: [0, 0.35, 0.7, 1],
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {s.emoji}
        </motion.div>
      ))}
    </div>
  );
}

// ---------- Variant 4: Concentric rings -----------------------------
function Rings() {
  const rings = [
    { color: "#F4C95D", delay: 0 },
    { color: "#E8836A", delay: 0.12 },
    { color: "#7FB3D5", delay: 0.24 },
  ];
  return (
    <div className="relative">
      {rings.map((r, i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            border: `10px solid ${r.color}`,
          }}
          initial={{ width: 0, height: 0, x: 0, y: 0, opacity: 1 }}
          animate={{
            width: 540,
            height: 540,
            x: -270,
            y: -270,
            opacity: [1, 0.9, 0],
          }}
          transition={{
            duration: 0.95,
            delay: r.delay,
            times: [0, 0.55, 1],
            ease: [0.16, 1, 0.3, 1],
          }}
        />
      ))}
      {/* Central pop */}
      <motion.div
        className="absolute left-1/2 top-1/2 rounded-full bg-yellow"
        initial={{ width: 0, height: 0, x: 0, y: 0, opacity: 0.9 }}
        animate={{
          width: 120,
          height: 120,
          x: -60,
          y: -60,
          opacity: [0.9, 0.5, 0],
        }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      />
    </div>
  );
}

// ---------- Variant 5: Bubble pop -----------------------------------
function Bubbles() {
  const bubbles = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const angle = (i / 14) * Math.PI * 2 + Math.random() * 0.4;
        const radius = 80 + Math.random() * 170;
        return {
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          size: 36 + Math.random() * 60,
          color: BURST_COLORS[i % BURST_COLORS.length],
          delay: Math.random() * 0.18,
        };
      }),
    [],
  );
  return (
    <div className="relative">
      {bubbles.map((b, i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: b.size,
            height: b.size,
            marginLeft: -b.size / 2,
            marginTop: -b.size / 2,
            background: b.color + "55",
            border: `4px solid ${b.color}`,
          }}
          initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
          animate={{
            x: b.x,
            y: b.y,
            scale: [0, 1.25, 1, 0],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 0.95,
            delay: b.delay,
            times: [0, 0.3, 0.7, 1],
            ease: [0.16, 1, 0.3, 1],
          }}
        />
      ))}
    </div>
  );
}

// =====================================================================
// Wrong-answer feedback — gentle shake (unchanged)
// =====================================================================
export function GentleShake({
  children,
  trigger,
}: {
  children: React.ReactNode;
  trigger: number;
}) {
  return (
    <motion.div
      key={trigger}
      animate={{ rotate: [0, -8, 8, -4, 0] }}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}

export function StuckHint({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-yellow/30 border-2 border-ink/60 rounded-xl p-4 text-lg"
    >
      {message}
    </motion.div>
  );
}
