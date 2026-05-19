// Particle trajectory generator — port of lab.js trajectory() into TypeScript.
// Returns an array of waypoints for one particle, given pattern + index + count.
// Use these to drive Framer Motion `animate` keyframe arrays on each emoji.

export type ParticlePattern =
  | "burst"
  | "spiral"
  | "ring"
  | "rain"
  | "arc"
  | "fountain";

export interface Waypoint {
  x: number;
  y: number;
  scale: number;
  rotate?: number;
  opacity: number;
  offset: number; // 0..1 along the timeline
}

const TAU = Math.PI * 2;

export function trajectory(
  pattern: ParticlePattern,
  i: number,
  count: number
): Waypoint[] {
  switch (pattern) {
    case "burst": {
      const a = (TAU * i) / count + (Math.random() - 0.5) * 0.5;
      const r = 110 + Math.random() * 35;
      return [
        { x: 0, y: 0, scale: 0.2, opacity: 0, offset: 0 },
        { x: Math.cos(a) * r * 0.55, y: Math.sin(a) * r * 0.55, scale: 1.15, opacity: 1, offset: 0.3 },
        { x: Math.cos(a) * r, y: Math.sin(a) * r, scale: 0.75, opacity: 0, offset: 1 },
      ];
    }
    case "spiral": {
      const start = (TAU * i) / count;
      const out: Waypoint[] = [];
      for (let k = 0; k <= 6; k++) {
        const t = k / 6;
        const ang = start + TAU * t * 1.1;
        const r = 18 + 95 * t;
        out.push({
          x: Math.cos(ang) * r,
          y: Math.sin(ang) * r,
          scale: 0.5 + t * 0.7,
          rotate: t * 360,
          opacity: t === 0 ? 0 : t < 0.85 ? 1 : 1 - (t - 0.85) / 0.15,
          offset: t,
        });
      }
      return out;
    }
    case "ring": {
      const a = (TAU * i) / count - Math.PI / 2;
      const r = 95;
      return [
        { x: 0, y: 0, scale: 0, opacity: 0, offset: 0 },
        { x: Math.cos(a) * r * 0.95, y: Math.sin(a) * r * 0.95, scale: 1.25, opacity: 1, offset: 0.45 },
        { x: Math.cos(a) * r, y: Math.sin(a) * r, scale: 1, opacity: 1, offset: 0.78 },
        { x: Math.cos(a) * r * 1.12, y: Math.sin(a) * r * 1.12, scale: 0.85, opacity: 0, offset: 1 },
      ];
    }
    case "rain": {
      const x = -110 + (220 * (i + 0.5)) / count + (Math.random() - 0.5) * 24;
      return [
        { x, y: -150, scale: 0.5, opacity: 0, offset: 0 },
        { x, y: -20, scale: 1, opacity: 1, offset: 0.4 },
        { x, y: 140, scale: 0.7, opacity: 0, offset: 1 },
      ];
    }
    case "arc": {
      const dir = i % 2 === 0 ? -1 : 1;
      const idx = Math.floor(i / 2);
      const xEnd = dir * (60 + idx * 28);
      const peak = -85 - idx * 6;
      return [
        { x: 0, y: 0, scale: 0.4, opacity: 0, offset: 0 },
        { x: xEnd * 0.45, y: peak, scale: 1.1, opacity: 1, offset: 0.45 },
        { x: xEnd * 0.85, y: peak * 0.4, scale: 1, opacity: 1, offset: 0.75 },
        { x: xEnd, y: 120, scale: 0.7, opacity: 0, offset: 1 },
      ];
    }
    case "fountain": {
      const x = (Math.random() - 0.5) * 90;
      const peak = -130 - Math.random() * 50;
      const drift = (Math.random() - 0.5) * 60;
      return [
        { x, y: 25, scale: 0.4, opacity: 0, offset: 0 },
        { x: x + drift * 0.3, y: peak, scale: 1.1, opacity: 1, offset: 0.42 },
        { x: x + drift, y: 140, scale: 0.7, opacity: 0, offset: 1 },
      ];
    }
  }
}
