import type { Problem, ProblemTemplate } from "@/lib/types";

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

function randInt(rng: () => number, lo: number, hi: number): number {
  return lo + Math.floor(rng() * (hi - lo + 1));
}

export function generateProblems(
  template: ProblemTemplate,
  seed: string,
): Problem[] {
  const rng = mulberry32(stringHash(seed));
  const out: Problem[] = [];
  let attempts = 0;
  while (out.length < template.count && attempts < template.count * 50) {
    attempts++;
    const a = randInt(
      rng,
      template.aRange?.[0] ?? 0,
      template.aRange?.[1] ?? 9,
    );
    const b = randInt(
      rng,
      template.bRange?.[0] ?? 0,
      template.bRange?.[1] ?? 9,
    );
    let answer: number = 0;
    switch (template.type) {
      case "add":
      case "make-ten":
        answer = a + b;
        break;
      case "subtract":
        answer = a - b;
        if (answer < 0) continue;
        break;
      case "missing-addend":
        answer = a - b;
        if (answer < 0) continue;
        break;
      case "equal-groups":
      case "array":
        answer = a * b;
        break;
      case "skip-count":
        answer = a * b;
        break;
    }
    if (template.constraint === "sum > 10" && a + b <= 10) continue;
    if (template.constraint === "sum <= 10" && a + b > 10) continue;
    out.push({
      id: `p-${out.length}`,
      a,
      b,
      answer,
      inputMode: "tap",
      showHint:
        typeof template.showHint === "string" ? template.showHint : undefined,
    });
  }
  return out;
}
