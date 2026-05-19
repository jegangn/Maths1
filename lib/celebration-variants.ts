// Paste this into your Next.js codebase (e.g. lib/celebration-variants.ts).
// Each variant's keyframe arrays are guaranteed equal-length so Framer Motion
// interpolates them in sync. Two variants are flagged `rare: true` — reserve
// these for 3+ correct in a row.

export type ParticlePattern =
  | "burst"
  | "spiral"
  | "ring"
  | "rain"
  | "arc"
  | "fountain";

export type EmojiKind = "⭐" | "✨" | "🎉" | "❤️" | "🌟" | "💫";

export interface CelebrationVariant {
  name: string;
  rare: boolean;
  animate: {
    y?: number[];
    x?: number[];
    scaleX?: number[];
    scaleY?: number[];
    rotate?: number[];
  };
  duration: number;
  particles: {
    emoji: EmojiKind;
    count: number;
    pattern: ParticlePattern;
  };
}

export const VARIANTS: CelebrationVariant[] = [
  {
    name: "double-bounce",
    rare: false,
    animate: {
      y:      [0, 6, -55, -45, 0, -22, 0],
      scaleY: [1, 0.88, 1.14, 1.05, 0.9, 1.08, 1],
      scaleX: [1, 1.12, 0.92, 0.96, 1.12, 0.95, 1],
      rotate: [0, 0, -8, -4, 2, 4, 0],
    },
    duration: 0.9,
    particles: { emoji: "⭐", count: 7, pattern: "burst" },
  },
  {
    name: "happy-wobble",
    rare: false,
    animate: {
      y:      [0, -4, -6, -4, -6, -3, 0],
      x:      [0, -8, 0, 8, 0, -4, 0],
      rotate: [0, -8, 0, 8, 0, -4, 0],
      scaleY: [1, 1.03, 1, 1.03, 1, 1.02, 1],
      scaleX: [1, 0.97, 1, 0.97, 1, 0.98, 1],
    },
    duration: 0.8,
    particles: { emoji: "✨", count: 6, pattern: "ring" },
  },
  {
    name: "spin-jump",
    rare: false,
    animate: {
      y:      [0, 5, -60, -45, -10, 0],
      scaleY: [1, 0.85, 1.1, 1.02, 0.92, 1],
      scaleX: [1, 1.18, 0.92, 0.98, 1.08, 1],
      rotate: [0, -10, 180, 340, 358, 360],
    },
    duration: 1.0,
    particles: { emoji: "🌟", count: 8, pattern: "spiral" },
  },
  {
    name: "squish-pop",
    rare: false,
    animate: {
      y:      [0, 10, 10, -50, -32, -4, 0],
      scaleY: [1, 0.65, 0.65, 1.18, 1.02, 0.95, 1],
      scaleX: [1, 1.3, 1.3, 0.88, 1.04, 1.06, 1],
      rotate: [0, 0, 0, 0, 0, 0, 0],
    },
    duration: 0.95,
    particles: { emoji: "🎉", count: 10, pattern: "fountain" },
  },
  {
    name: "side-shimmy",
    rare: false,
    animate: {
      y:      [0, -2, -4, -2, -4, -2, -4, 0],
      x:      [0, -10, 10, -10, 10, -5, 5, 0],
      rotate: [0, -6, 6, -6, 6, -3, 3, 0],
      scaleY: [1, 1.01, 1.02, 1.01, 1.02, 1.01, 1.02, 1],
      scaleX: [1, 0.99, 0.98, 0.99, 0.98, 0.99, 0.98, 1],
    },
    duration: 0.9,
    particles: { emoji: "❤️", count: 5, pattern: "ring" },
  },
  {
    name: "tippy-toes",
    rare: false,
    animate: {
      y:      [0, -3, -8, -12, -10, -6, 0],
      scaleY: [1, 1.04, 1.06, 1.08, 1.06, 1.03, 1],
      scaleX: [1, 0.98, 0.97, 0.96, 0.97, 0.99, 1],
      rotate: [0, 0, 0, 0, 0, 0, 0],
    },
    duration: 1.1,
    particles: { emoji: "✨", count: 5, pattern: "rain" },
  },
  {
    name: "boing",
    rare: false,
    animate: {
      y:      [0, 14, -70, -55, -12, -25, -5, 0],
      scaleY: [1, 0.55, 1.28, 1.1, 0.92, 1.08, 0.96, 1],
      scaleX: [1, 1.4, 0.84, 0.93, 1.1, 0.95, 1.04, 1],
      rotate: [0, 0, 0, 0, 0, 0, 0, 0],
    },
    duration: 1.05,
    particles: { emoji: "⭐", count: 8, pattern: "arc" },
  },
  {
    name: "wiggle-cheer",
    rare: false,
    animate: {
      y:      [0, -5, -8, -5, -8, -5, -8, 0],
      rotate: [0, -8, 8, -8, 8, -4, 4, 0],
      scaleY: [1, 1.05, 1.02, 1.05, 1.02, 1.05, 1.02, 1],
      scaleX: [1, 0.95, 0.98, 0.95, 0.98, 0.95, 0.98, 1],
    },
    duration: 0.85,
    particles: { emoji: "🎉", count: 6, pattern: "burst" },
  },
  {
    name: "tumble-flip",
    rare: true,
    animate: {
      y:      [0, 8, -50, -65, -50, -20, 0],
      x:      [0, 0, 18, 0, -18, 0, 0],
      rotate: [0, -15, 90, 200, 310, 355, 360],
      scaleY: [1, 0.85, 1, 1, 1, 0.95, 1],
      scaleX: [1, 1.15, 1, 1, 1, 1.05, 1],
    },
    duration: 1.3,
    particles: { emoji: "💫", count: 12, pattern: "spiral" },
  },
  {
    name: "twirl-of-joy",
    rare: true,
    animate: {
      y:      [0, 6, -35, -50, -35, -10, 0],
      rotate: [0, 0, 360, 540, 720, 720, 720],
      scaleY: [1, 0.88, 1.06, 1.0, 1.06, 0.95, 1],
      scaleX: [1, 1.15, 0.94, 1.0, 0.94, 1.05, 1],
    },
    duration: 1.4,
    particles: { emoji: "🌟", count: 10, pattern: "ring" },
  },
];
