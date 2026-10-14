import { mkdir, writeFile } from 'node:fs/promises';

// Три оригинальные демонстрационные последовательности, PCM16 mono WAV.
// Никакие сторонние записи или фрагменты популярных песен не используются.
const melodies = {
  sunrise: [60, 64, 67, 72, 69, 67, 64, 60],
  rain: [57, 60, 64, 62, 60, 57, 55, 57],
  night: [48, 55, 58, 55, 60, 58, 55, 48],
};
const sampleRate = 22050, noteSeconds = 0.8;
const directory = new URL('../assets/audio/', import.meta.url);
await mkdir(directory, { recursive: true });
for (const [name, notes] of Object.entries(melodies)) {
  const samples = Math.round(notes.length * noteSeconds * sampleRate);
  const buffer = Buffer.alloc(44 + samples * 2);
  buffer.write('RIFF'); buffer.writeUInt32LE(buffer.length - 8, 4); buffer.write('WAVE', 8);
  buffer.write('fmt ', 12); buffer.writeUInt32LE(16, 16); buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22); buffer.writeUInt32LE(sampleRate, 24); buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32); buffer.writeUInt16LE(16, 34); buffer.write('data', 36); buffer.writeUInt32LE(samples * 2, 40);
  for (let i = 0; i < samples; i++) {
    const seconds = i / sampleRate;
    const index = Math.min(Math.floor(seconds / noteSeconds), notes.length - 1);
    const local = seconds - index * noteSeconds;
    const envelope = Math.min(1, local / 0.03) * Math.max(0, Math.min(1, (noteSeconds - local) / 0.18));
    const frequency = 440 * 2 ** ((notes[index] - 69) / 12);
    const wave = Math.sin(2 * Math.PI * frequency * local) + 0.15 * Math.sin(4 * Math.PI * frequency * local);
    buffer.writeInt16LE(Math.round(6500 * envelope * wave), 44 + i * 2);
  }
  await writeFile(new URL(`${name}.wav`, directory), buffer);
  console.log(`${name}.wav: ${buffer.length} bytes, ${(samples / sampleRate).toFixed(1)} s`);
}
