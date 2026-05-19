"use client";
import { motion } from "framer-motion";
import {
  type CharacterId,
  type CelebrationVariant,
  trajectory,
} from "@/lib/mascotData";

export type MascotEmotion =
  | "idle"
  | "watching"
  | "thinking"
  | "happy"
  | "encouraging"
  | "celebrating";

interface Props {
  emotion?: MascotEmotion;
  /** Which character to display. Defaults to "cat" (Riko). */
  character?: CharacterId;
  /** Celebration variant. Only used when emotion === "happy". */
  variant?: CelebrationVariant;
}

const sizes: Record<MascotEmotion, number> = {
  idle: 180,
  watching: 180,
  thinking: 180,
  happy: 180,
  encouraging: 180,
  celebrating: 220,
};

// Each character has two SVG faces: idle and celebrating.
function resolveFace(emotion: MascotEmotion): "idle" | "celebrating" {
  if (emotion === "happy" || emotion === "celebrating") return "celebrating";
  return "idle";
}

// Continuous idle motion — breathing + sway + tiny bob.
// Felt sub-consciously; absence makes the mascot feel frozen.
const IDLE_LOOP = {
  y: [0, -3, 0, -2, 0],
  scaleY: [1, 1.018, 1, 1.012, 1],
  scaleX: [1, 0.992, 1, 0.995, 1],
  rotate: [0, 0.6, 0, -0.6, 0],
};

const IDLE_TRANSITION = {
  duration: 3.5,
  repeat: Infinity,
  ease: "easeInOut" as const,
  repeatType: "loop" as const,
};

export function Mascot({
  emotion = "idle",
  character = "cat",
  variant,
}: Props) {
  const face = resolveFace(emotion);
  const isHappy = emotion === "happy" || emotion === "celebrating";
  const activeVariant = isHappy ? variant : undefined;

  return (
    <div className="relative inline-block">
      <motion.div
        // Re-key when variant or character changes so animations re-trigger cleanly.
        key={`${character}-${activeVariant?.name ?? "idle"}`}
        className="relative inline-block"
        // transform-origin at bottom-center: squash compresses toward the feet,
        // stretch elongates upward. Without this, squashes look like the
        // character is being shoved through the floor.
        style={{ transformOrigin: "50% 100%" }}
        animate={activeVariant ? activeVariant.animate : IDLE_LOOP}
        transition={
          activeVariant
            ? {
                duration: activeVariant.duration,
                ease: [0.34, 1.1, 0.55, 1], // gentle ease-out with mild overshoot
              }
            : IDLE_TRANSITION
        }
      >
        <img
          data-testid="mascot-img"
          src={`/mascots/${character}-${face}.svg`}
          alt={`${character} ${emotion}`}
          width={sizes[emotion]}
          height={sizes[emotion]}
          draggable={false}
        />

        {/* Particle effects — waypoint-driven per variant */}
        {activeVariant && <ParticleField variant={activeVariant} />}
      </motion.div>
    </div>
  );
}

function ParticleField({ variant }: { variant: CelebrationVariant }) {
  const { emoji, count, pattern } = variant.particles;
  // Particle duration is slightly longer than mascot's animation so the last
  // sparkles finish floating away after the squash-and-stretch settles.
  const particleDuration = variant.duration + 0.25;

  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const waypoints = trajectory(pattern, i, count);
        // Convert waypoint array → parallel arrays for Framer Motion keyframes.
        const xs = waypoints.map((w) => w.x);
        const ys = waypoints.map((w) => w.y);
        const scales = waypoints.map((w) => w.scale);
        const opacities = waypoints.map((w) => w.opacity);
        const rotates = waypoints.map((w) => w.rotate ?? 0);
        const times = waypoints.map((w) => w.offset);

        return (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2 text-3xl pointer-events-none select-none"
            style={{ marginLeft: -14, marginTop: -14 }}
            initial={false}
            animate={{
              x: xs,
              y: ys,
              scale: scales,
              opacity: opacities,
              rotate: rotates,
            }}
            transition={{
              duration: particleDuration,
              times,
              ease: "easeOut",
            }}
          >
            {emoji}
          </motion.span>
        );
      })}
    </>
  );
}
