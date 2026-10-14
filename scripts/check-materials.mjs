import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';

const project = new URL('../', import.meta.url);
const ignored = new Set(['node_modules', 'dist', 'output', '.expo', '.git', '.firebase']);
async function ownFiles(directory = project, prefix = '') {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const name = `${prefix}${entry.name}`;
    if (entry.isDirectory()) result.push(...await ownFiles(new URL(`${entry.name}/`, directory), `${name}/`));
    else if (entry.isFile() && (/(\.tsx?|\.mjs|\.json|\.md)$/.test(name) || ['.gitignore', '.env.example'].includes(name))
      && !['package-lock.json', 'docs/MANUAL.md'].includes(name)) result.push(name);
  }
  return result;
}
function visibleMarkdown(contents) {
  let fence = null;
  const visible = [];
  for (const line of contents.split(/\r?\n/)) {
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (marker) {
      if (!fence) fence = marker[1];
      else if (marker[1][0] === fence[0] && marker[1].length >= fence.length && !marker[2].trim()) fence = null;
      continue;
    }
    if (!fence) visible.push(line);
  }
  assert.equal(fence, null, 'Unclosed Markdown fence');
  return visible.join('\n');
}
const files = await ownFiles();
const manuals = [new URL('docs/MANUAL.md', project)];
try { await access(new URL('../../assignments/final-mobile-soundshades.md', project)); manuals.push(new URL('../../guides/final-mobile-soundshades.md', project)); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
for (const manual of manuals) {
  const contents = await readFile(manual, 'utf8');
  visibleMarkdown(contents);
  for (const name of files) {
    const code = (await readFile(new URL(name, project), 'utf8')).trimEnd();
    assert.ok(contents.includes(`### ${name}\n`) && contents.includes(`\n${code}\n`), `Missing full contents: ${name}`);
  }
  console.log(`${fileURLToPath(manual)}: ${files.length}/${files.length} full own files, fences PASS`);
}
let links = 0;
const markdownFiles = files.filter((name) => name.endsWith('.md') && name !== 'docs/MANUAL_SOURCE.md').map((name) => new URL(name, project));
for (const file of [...markdownFiles, ...manuals]) {
  const contents = visibleMarkdown(await readFile(file, 'utf8'));
  for (const match of contents.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const target = match[1].replace(/^<|>$/g, '').split('#')[0];
    if (!target || /^[a-z]+:/i.test(target)) continue;
    await access(pathToFileURL(resolve(dirname(fileURLToPath(file)), decodeURIComponent(target)))); links++;
  }
}
console.log(`Local Markdown links: ${links} PASS`);
for (const name of ['sunrise', 'rain', 'night']) {
  const wav = await readFile(new URL(`assets/audio/${name}.wav`, project));
  assert.equal(wav.toString('ascii', 0, 4), 'RIFF'); assert.equal(wav.toString('ascii', 8, 12), 'WAVE');
  assert.equal(wav.readUInt16LE(20), 1); assert.equal(wav.readUInt16LE(22), 1);
  assert.equal(wav.readUInt32LE(24), 22050); assert.equal(wav.readUInt16LE(34), 16);
  assert.equal(wav.readUInt32LE(40), wav.length - 44);
  assert.equal((wav.length - 44) / 2 / 22050, 6.4);
  let peak = 0; for (let index = 44; index < wav.length; index += 2) peak = Math.max(peak, Math.abs(wav.readInt16LE(index)));
  assert.ok(peak > 0 && peak < 32767);
  console.log(`${name}.wav: PCM16 mono 22050 Hz, 6.4s, peak ${peak}, PASS`);
}
