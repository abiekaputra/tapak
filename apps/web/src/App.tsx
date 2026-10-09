// Module responsible for switching between operator authentication and workspace.
import { useState } from 'react';

import type { Session } from '@tapak/contracts';

import { Login } from './components/Login';
import { OperatorConsole } from './components/OperatorConsole';
import { loadSession, saveSession } from './session';

export function App() {
  const [session, setSession] = useState<Session | null>(loadSession);

  function updateSession(next: Session | null) {
    saveSession(next);
    setSession(next);
  }

  return session ? (
    <OperatorConsole session={session} onSignOut={() => updateSession(null)} />
  ) : (
    <Login onAuthenticated={updateSession} />
  );
}
