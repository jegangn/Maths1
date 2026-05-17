import { Howl } from "howler";

type SoundName = "correct" | "wrong" | "win" | "drop" | "tap";

const sounds: Partial<Record<SoundName, Howl>> = {};

function get(name: SoundName): Howl {
  if (!sounds[name]) {
    sounds[name] = new Howl({
      src: [`/sounds/${name}.wav`],
      volume: name === "win" ? 0.7 : 0.5,
      preload: true,
    });
  }
  return sounds[name]!;
}

export function play(name: SoundName) {
  if (typeof window === "undefined") return;
  get(name).play();
}
