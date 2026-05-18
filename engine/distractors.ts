function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function stringHash(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function generateDistractors(
  answer: number,
  a: number,
  b: number,
  seed: string,
): number[] {
  const rng = mulberry32(stringHash(seed));
  const candidates = new Set<number>();
  const offsets = [-1, 1, -2, 2, -3, 3];
  let attempts = 0;
  while (candidates.size < 2 && attempts < 100) {
    attempts++;
    const offset = offsets[Math.floor(rng() * offsets.length)];
    const val = answer + offset;
    if (val <= 0 || val === answer || val === a || val === b) continue;
    candidates.add(val);
  }
  return Array.from(candidates).slice(0, 2);
}
