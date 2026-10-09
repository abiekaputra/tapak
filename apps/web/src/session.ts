// Module responsible for retaining the local operator session in browser storage.
import type { Session } from '@tapak/contracts';

const key = 'tapak.operator.session';

export function loadSession(): Session | null {
  const stored = sessionStorage.getItem(key);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as Session;
  } catch {
    sessionStorage.removeItem(key);
    return null;
  }
}

export function saveSession(session: Session | null) {
  if (session) sessionStorage.setItem(key, JSON.stringify(session));
  else sessionStorage.removeItem(key);
}
