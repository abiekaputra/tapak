// Module responsible for enforcing source and test file line limits.
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const roots = ['apps', 'packages', 'tests', 'scripts'];
const extensions = new Set(['.ts', '.tsx', '.js', '.mjs', '.css']);
const ignored = new Set(['node_modules', 'dist', '.expo']);
const violations = [];

async function inspect(directory) {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') return;
    throw error;
  }
  for (const entry of entries) {
    if (ignored.has(entry.name)) continue;
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) await inspect(target);
    if (!entry.isFile() || !extensions.has(path.extname(entry.name))) continue;
    const lines = (await readFile(target, 'utf8')).split('\n').length;
    const isTest = /(?:\.test\.|tests\/)/u.test(target);
    const limit = isTest ? 1000 : 300;
    if (lines > limit) violations.push(`${target}: ${lines}/${limit}`);
  }
}

for (const root of roots) await inspect(root);
if (violations.length) {
  console.error(violations.join('\n'));
  process.exitCode = 1;
} else {
  console.log('File line limits passed.');
}
