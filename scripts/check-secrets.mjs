// Module responsible for rejecting common credential formats before commit.
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const ignored = new Set([
  '.git',
  '.expo',
  'node_modules',
  'dist',
  'artifacts',
  'runtime',
]);
const binary = new Set(['.db', '.ico', '.jpg', '.png', '.zip']);
const patterns = [
  /gh[pousr]_[A-Za-z0-9_]{20,}/u,
  /AKIA[0-9A-Z]{16}/u,
  /sk-[A-Za-z0-9]{20,}/u,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/u,
];
const violations = [];

async function inspect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) await inspect(target);
    if (
      !entry.isFile() ||
      binary.has(path.extname(target)) ||
      target.endsWith('pnpm-lock.yaml')
    )
      continue;
    const content = await readFile(target, 'utf8');
    if (patterns.some((pattern) => pattern.test(content))) violations.push(target);
  }
}

await inspect('.');
if (violations.length) {
  console.error(`Potential credentials found:\n${violations.join('\n')}`);
  process.exitCode = 1;
} else {
  console.log('Credential pattern scan passed.');
}
