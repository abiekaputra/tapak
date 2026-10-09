// Module responsible for enforcing navigable source directory size and depth.
import { readdir } from 'node:fs/promises';
import path from 'node:path';

const roots = [
  'apps/api/src',
  'apps/mobile/src',
  'apps/web/src',
  'packages/contracts/src',
  'packages/domain/src',
];
const violations = [];

async function inspect(root, directory = root) {
  const entries = (await readdir(directory, { withFileTypes: true })).filter(
    (entry) => !entry.name.startsWith('.'),
  );
  if (entries.length > 20) violations.push(`${directory}: ${entries.length}/20 entries`);
  const depth = path.relative(root, directory).split(path.sep).filter(Boolean).length;
  if (depth > 4) violations.push(`${directory}: depth ${depth}/4`);
  for (const entry of entries)
    if (entry.isDirectory()) await inspect(root, path.join(directory, entry.name));
}

for (const root of roots) await inspect(root);
if (violations.length) {
  console.error(violations.join('\n'));
  process.exitCode = 1;
} else {
  console.log('Source directory limits passed.');
}
