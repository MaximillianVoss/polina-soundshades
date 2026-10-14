import { access, mkdir, readFile, writeFile } from 'node:fs/promises';

const project = new URL('../', import.meta.url);
const ownFiles = [
  'package.json', 'app.json', 'tsconfig.json', 'index.ts', 'App.tsx',
  'src/domain.ts', 'src/demo.ts', 'src/backend.ts', 'src/persistence.ts', 'src/persistence.native.ts',
  'database.rules.json', 'firebase.json', '.env.example', '.gitignore',
  'tests/domain.test.ts', 'tests/demo.test.ts', 'tests/firebase-rules.test.mjs',
  'scripts/generate-audio.mjs', 'scripts/serve-web.mjs', 'scripts/build-manual.mjs', 'scripts/check-materials.mjs',
  'README.md', 'docs/ASSIGNMENT.md', 'docs/DEMO.md', 'docs/LEARNING_DIARY.md', 'VERIFICATION.md', 'docs/MANUAL_SOURCE.md',
];
const source = await readFile(new URL('docs/MANUAL_SOURCE.md', project), 'utf8');
const files = await Promise.all(ownFiles.map(async (path) => {
  const contents = await readFile(new URL(path, project), 'utf8');
  const language = path.endsWith('.tsx') ? 'tsx' : path.endsWith('.ts') ? 'typescript'
    : path.endsWith('.mjs') ? 'javascript' : path.endsWith('.json') ? 'json' : path.endsWith('.md') ? 'markdown' : 'text';
  const fence = '`'.repeat(Math.max(4, ...Array.from(contents.matchAll(/`+/g), (match) => match[0].length + 1)));
  return `\n### ${path}\n\n${fence}${language}\n${contents.trimEnd()}\n${fence}\n`;
}));
const render = (assignment, readme, verification) => source
  .replaceAll('{{ASSIGNMENT_LINK}}', assignment).replaceAll('{{README_LINK}}', readme)
  .replaceAll('{{VERIFICATION_LINK}}', verification) + files.join('');
await mkdir(new URL('docs/', project), { recursive: true });
await writeFile(new URL('docs/MANUAL.md', project), render('ASSIGNMENT.md', '../README.md', '../VERIFICATION.md'), 'utf8');
console.log(`docs/MANUAL.md: full contents of ${ownFiles.length} own text files`);
// Полный комплект имеет assignments рядом с solutions. В самостоятельном ZIP
// приложение генерирует только собственный MANUAL, не создавая чужой parent tree.
try {
  await access(new URL('../../assignments/final-mobile-soundshades.md', project));
  await writeFile(new URL('../../guides/final-mobile-soundshades.md', project),
    render('../assignments/final-mobile-soundshades.md', '../solutions/soundshades/README.md', '../solutions/soundshades/VERIFICATION.md'), 'utf8');
  console.log('guides/final-mobile-soundshades.md: synchronized');
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
  console.log('Standalone project: external guide was not written.');
}
