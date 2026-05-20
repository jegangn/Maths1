// Synthesized sounds via Web Audio API.
//
// Why synth instead of WAV files: every kids'-app WAV I've heard sounds
// thin and harsh, with clicky starts. Synthesizing gives us:
//   - Smooth ADSR envelopes (exponential decay) — no clicks or pops.
//   - Layered oscillators (sub-bass + fundamental + octave triangle) for
//     that "fat" full-bodied feel rather than thin beeps.
//   - Zero asset footprint, instant load.
//   - The streak pitch-up feature keeps working — `rate` just multiplies
//     every frequency in the patch.
//
// API stays identical to the old Howler-based loader, so callers (button
// clicks, LessonPlayer correct/wrong, etc.) don't change.

type SoundName = "correct" | "wrong" | "win" | "drop" | "tap";

interface PlayOptions {
  /** Pitch / speed multiplier. 1 = default. >1 raises pitch (e.g. 1.25 for
   * a streak ping). Frequencies are multiplied; envelope timings are not,
   * so the sound stays the same length but gets brighter. */
  rate?: number;
  /** 0..1, overrides the per-call mixer gain for this single play. */
  volume?: number;
}

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

/**
 * Lazily build the audio graph on the first user-initiated `play()`.
 * Mobile browsers block AudioContext creation until a real user gesture;
 * by deferring until then we sidestep that without any unlock dance.
 */
function ensureContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return null;
    ctx = new Ctx();
    master = ctx.createGain();
    master.gain.value = 0.6; // headroom — keeps stacked layers from clipping
    master.connect(ctx.destination);
  }
  // Safari sometimes suspends the context when the tab loses focus.
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/**
 * Schedule one oscillator with an ADSR envelope, optionally sweeping its
 * pitch over the note's lifetime (used for "drop" thunk and "wrong" dip).
 */
function tone(
  freq: number,
  type: OscillatorType,
  durationSec: number,
  attackSec: number,
  peakGain: number,
  startTime: number,
  dest: AudioNode,
  pitchEndHz?: number,
) {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  if (pitchEndHz !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(1, pitchEndHz),
      startTime + durationSec,
    );
  }
  // Envelope. Linear attack so the sound enters cleanly, exponential decay
  // so the tail sounds natural (matching how real reverb dies away).
  env.gain.setValueAtTime(0, startTime);
  env.gain.linearRampToValueAtTime(peakGain, startTime + attackSec);
  env.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSec);
  osc.connect(env).connect(dest);
  osc.start(startTime);
  osc.stop(startTime + durationSec + 0.02);
}

/**
 * A short noise burst — adds "air" and texture to percussive sounds like
 * `tap` and `drop`, the way a real click has a little high-frequency
 * fizz on top of the bass body. ~50ms band-pass-filtered noise.
 */
function noiseBurst(
  freq: number,
  q: number,
  durationSec: number,
  peakGain: number,
  startTime: number,
  dest: AudioNode,
) {
  if (!ctx) return;
  const bufferSize = Math.floor(ctx.sampleRate * durationSec * 1.5);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = freq;
  filter.Q.value = q;
  const env = ctx.createGain();
  env.gain.setValueAtTime(0, startTime);
  env.gain.linearRampToValueAtTime(peakGain, startTime + 0.002);
  env.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSec);
  src.connect(filter).connect(env).connect(dest);
  src.start(startTime);
  src.stop(startTime + durationSec + 0.02);
}

// ─── Patches ────────────────────────────────────────────────────────────
//
// Each function lays down a few simultaneous oscillators. The key to a
// "smooth and full" sound is layering, not loudness:
//   • a sub-bass oscillator (100-200 Hz) for body
//   • a fundamental sine for the main pitch
//   • a triangle one octave up for a touch of shimmer
//   • optional band-passed noise for percussive air

function patchTap(rate: number, dest: AudioNode, startTime: number) {
  // Light, friendly click. Two short sine layers + a tiny noise sparkle.
  tone(900 * rate, "sine", 0.06, 0.003, 0.22, startTime, dest); // bright snap
  tone(450 * rate, "sine", 0.09, 0.004, 0.18, startTime, dest); // warm body
  noiseBurst(3000, 8, 0.025, 0.06, startTime, dest); // tiny air
}

function patchDrop(rate: number, dest: AudioNode, startTime: number) {
  // Heavier thunk — confirm/place feel. Sub-bass with a pitch drop, plus
  // a mid for definition and a quick noise tail for impact.
  tone(180 * rate, "sine", 0.18, 0.002, 0.55, startTime, dest, 70 * rate);
  tone(360 * rate, "sine", 0.1, 0.003, 0.18, startTime, dest);
  noiseBurst(1200, 4, 0.04, 0.08, startTime, dest);
}

function patchCorrect(rate: number, dest: AudioNode, startTime: number) {
  // Bright rising perfect-fifth (C5 → G5). Two notes with shimmer + bass
  // body so the chime feels warm rather than tinny.
  const c5 = 523.25 * rate;
  const g5 = 783.99 * rate;
  // Note 1
  tone(c5, "sine", 0.22, 0.01, 0.3, startTime, dest);
  tone(c5 * 2, "triangle", 0.22, 0.01, 0.08, startTime, dest);
  // Note 2 (90 ms after — quick rise so it reads as one gesture)
  const t2 = startTime + 0.09;
  tone(g5, "sine", 0.32, 0.01, 0.32, t2, dest);
  tone(g5 * 2, "triangle", 0.32, 0.01, 0.09, t2, dest);
  // Sustained sub-bass for body throughout — the "umph"
  tone(130.81 * rate, "sine", 0.5, 0.02, 0.22, startTime, dest);
}

function patchWrong(rate: number, dest: AudioNode, startTime: number) {
  // Soft, descending "uh-oh" — deliberately gentle for a 5-year-old. No
  // harsh buzz: just a low sine that bends down a couple semitones, with
  // a sub-bass underneath for body.
  tone(220 * rate, "sine", 0.4, 0.015, 0.32, startTime, dest, 165 * rate);
  tone(110 * rate, "sine", 0.45, 0.02, 0.24, startTime, dest, 82.5 * rate);
  // A tiny wobble adds emotion without being abrasive
  tone(330 * rate, "triangle", 0.3, 0.02, 0.06, startTime, dest, 247 * rate);
}

function patchWin(rate: number, dest: AudioNode, startTime: number) {
  // Triumphant arpeggio (C-E-G-C) then a sustained chord, with a deep
  // bass swell for the full "you did it!" feel.
  const notes = [261.63, 329.63, 392.0, 523.25].map((n) => n * rate);
  // Arpeggio rise
  notes.forEach((freq, i) => {
    const t = startTime + i * 0.12;
    tone(freq, "sine", 0.5, 0.01, 0.26, t, dest);
    tone(freq * 2, "triangle", 0.5, 0.01, 0.09, t, dest);
  });
  // Sustained chord starting after the arpeggio peaks
  const chordStart = startTime + 0.48;
  notes.forEach((freq) => {
    tone(freq, "sine", 0.85, 0.04, 0.16, chordStart, dest);
  });
  // Deep bass swell that runs underneath the whole thing — major umph
  tone(65.41 * rate, "sine", 1.4, 0.05, 0.38, startTime, dest);
  tone(130.81 * rate, "sine", 1.4, 0.05, 0.22, startTime, dest);
}

const patches: Record<
  SoundName,
  (rate: number, dest: AudioNode, startTime: number) => void
> = {
  tap: patchTap,
  drop: patchDrop,
  correct: patchCorrect,
  wrong: patchWrong,
  win: patchWin,
};

const defaultVolumes: Record<SoundName, number> = {
  tap: 0.7,
  drop: 0.8,
  correct: 0.85,
  wrong: 0.7,
  win: 1.0,
};

export function play(name: SoundName, options?: PlayOptions) {
  const c = ensureContext();
  if (!c || !master) return;
  // Per-call mixer node so `volume` override doesn't leak into other plays.
  const mixer = c.createGain();
  mixer.gain.value = options?.volume ?? defaultVolumes[name];
  mixer.connect(master);
  patches[name](options?.rate ?? 1, mixer, c.currentTime);
}
