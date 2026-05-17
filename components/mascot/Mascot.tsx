"use client";
import { motion } from "framer-motion";

export type MascotEmotion =
  | "idle"
  | "watching"
  | "thinking"
  | "happy"
  | "encouraging"
  | "celebrating";

interface Props {
  emotion?: MascotEmotion;
}

const sizes: Record<MascotEmotion, number> = {
  idle: 180,
  watching: 180,
  thinking: 180,
  happy: 180,
  encouraging: 180,
  celebrating: 220,
};

export function Mascot({ emotion = "idle" }: Props) {
  return (
    <motion.div
      key={emotion}
      initial={emotion === "happy" ? { y: 0 } : undefined}
      animate={
        emotion === "happy"
          ? { y: [0, -40, 0] }
          : emotion === "celebrating"
            ? { rotate: [-5, 5, -5, 5, 0] }
            : undefined
      }
      transition={{ type: "spring", stiffness: 300, damping: 12 }}
    >
      <img
        data-testid="mascot-img"
        src={`/mascot/${emotion}.svg`}
        alt={`Riko ${emotion}`}
        width={sizes[emotion]}
        height={sizes[emotion]}
        draggable={false}
      />
    </motion.div>
  );
}
