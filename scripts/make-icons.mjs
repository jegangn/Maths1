import sharp from 'sharp';
import { readFileSync } from 'fs';

const svg = readFileSync('public/mascot/idle.svg');

await sharp(svg, { density: 300 })
  .resize(192, 192, { fit: 'contain', background: '#FAF1E1' })
  .png()
  .toFile('public/icon-192.png');

await sharp(svg, { density: 300 })
  .resize(512, 512, { fit: 'contain', background: '#FAF1E1' })
  .png()
  .toFile('public/icon-512.png');

console.log('Icons generated: icon-192.png and icon-512.png');
