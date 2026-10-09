// Module responsible for running the local Tapak API and operator console together.
import { spawn } from 'node:child_process';

const commands = [
  ['API', ['--filter', '@tapak/api', 'dev']],
  ['WEB', ['--filter', '@tapak/web', 'dev']],
];
const children = commands.map(([name, args]) => {
  const child = spawn('pnpm', args, { stdio: ['inherit', 'pipe', 'pipe'] });
  child.stdout.on('data', (chunk) => process.stdout.write(`[${name}] ${chunk}`));
  child.stderr.on('data', (chunk) => process.stderr.write(`[${name}] ${chunk}`));
  return child;
});

function stop() {
  for (const child of children) child.kill('SIGTERM');
}

process.on('SIGINT', stop);
process.on('SIGTERM', stop);
await Promise.race(
  children.map((child) => new Promise((resolve) => child.on('exit', resolve))),
);
stop();
