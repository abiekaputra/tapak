// Module responsible for hashing and comparing local account passwords.
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export function hashPassword(password: string, salt = randomBytes(16).toString('hex')) {
  const hash = scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, salt: string, expectedHash: string) {
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHash, 'hex');
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}
