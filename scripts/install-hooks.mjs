// Module responsible for installing the repository-managed pre-commit hook.
import { chmod, copyFile, mkdir } from 'node:fs/promises';

try {
  await mkdir('.git/hooks', { recursive: true });
  await copyFile('scripts/pre-commit', '.git/hooks/pre-commit');
  await chmod('.git/hooks/pre-commit', 0o755);
} catch {
  // Package installation can run before Git initialization in a fresh checkout.
}
