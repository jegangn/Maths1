import { Howl } from "howler";

type SoundName = "correct" | "wrong" | "win" | "drop" | "tap";

interface PlayOptions {
  /** Playback rate. 1.0 is normal; >1 raises pitch + speed (e.g. 1.25 for a
   * brighter streak reward); <1 lowers them. Resets between plays so a
   * pitch-shifted play doesn't leak into the next default play. */
  rate?: number;
  /** Override volume for a single play (0..1). Falls back to the per-sound
   * default set when the Howl is created. */
  volume?: number;
}

const sounds: Partial<Record<SoundName, Howl>> = {};
const defaultVolumes: Record<SoundName, number> = {
  correct: 0.5,
  wrong: 0.5,
  win: 0.7,
  drop: 0.5,
  tap: 0.5,
};

function get(name: SoundName): Howl {
  if (!sounds[name]) {
    // Same base-path trick as the other public assets: locally this is "",
    // on GitHub Pages it's "/Maths1". Baked at build time.
    const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
    sounds[name] = new Howl({
      src: [`${base}/sounds/${name}.wav`],
      volume: defaultVolumes[name],
      preload: true,
    });
  }
  return sounds[name]!;
}

export function play(name: SoundName, options?: PlayOptions) {
  if (typeof window === "undefined") return;
  const h = get(name);
  // Reset to defaults first so a previous custom rate/volume doesn't linger.
  h.rate(options?.rate ?? 1);
  h.volume(options?.volume ?? defaultVolumes[name]);
  h.play();
}
