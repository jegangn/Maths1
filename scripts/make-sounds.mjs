import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

// Simple WAV file generator (mono, 16-bit PCM, 44.1kHz)
function makeWav(samples) {
  const sampleRate = 44100;
  const bytesPerSample = 2;
  const buffer = Buffer.alloc(44 + samples.length * bytesPerSample);
  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + samples.length * bytesPerSample, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * bytesPerSample, 28);
  buffer.writeUInt16LE(bytesPerSample, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(samples.length * bytesPerSample, 40);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(s * 32767), 44 + i * 2);
  }
  return buffer;
}

// Envelope: linear attack, exponential decay
function env(t, total, attack = 0.01, decay = 0.3) {
  if (t < attack) return t / attack;
  return Math.exp(-(t - attack) / decay);
}

// Generate a tone with given frequency + duration (seconds)
function tone(freq, duration, attack = 0.01, decay = 0.3) {
  const sampleRate = 44100;
  const n = Math.floor(duration * sampleRate);
  const samples = new Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    samples[i] = 0.3 * env(t, duration, attack, decay) * Math.sin(2 * Math.PI * freq * t);
  }
  return samples;
}

// Mix multiple tones
function mix(...layers) {
  const len = Math.max(...layers.map((l) => l.length));
  const out = new Array(len).fill(0);
  for (const layer of layers) {
    for (let i = 0; i < layer.length; i++) out[i] += layer[i];
  }
  // Normalise to avoid clipping
  const max = Math.max(...out.map(Math.abs));
  if (max > 1) for (let i = 0; i < out.length; i++) out[i] /= max;
  return out;
}

// Concatenate
function concat(...parts) {
  const out = [];
  for (const part of parts) for (const s of part) out.push(s);
  return out;
}

// Ensure directory exists
mkdirSync('public/sounds', { recursive: true });

// correct: bright two-note rising (C5 -> E5)
writeFileSync('public/sounds/correct.wav', makeWav(concat(tone(523, 0.12, 0.005, 0.1), tone(659, 0.18, 0.005, 0.15))));
// wrong: soft low thunk (G3, short)
writeFileSync('public/sounds/wrong.wav', makeWav(tone(196, 0.18, 0.005, 0.12)));
// win: ascending arpeggio C5-E5-G5-C6
writeFileSync('public/sounds/win.wav', makeWav(concat(tone(523, 0.12, 0.005, 0.1), tone(659, 0.12, 0.005, 0.1), tone(784, 0.12, 0.005, 0.1), tone(1047, 0.4, 0.005, 0.25))));
// drop: short percussive (medium frequency)
writeFileSync('public/sounds/drop.wav', makeWav(tone(440, 0.06, 0.001, 0.04)));
// tap: very short high blip
writeFileSync('public/sounds/tap.wav', makeWav(tone(880, 0.04, 0.001, 0.025)));

console.log('Generated 5 WAV files in public/sounds/');
