// Module responsible for authenticating operators into the Tapak console.
import { useState, type FormEvent } from 'react';

import type { Session } from '@tapak/contracts';

import { api } from '../api';
import { Brand } from './Brand';

export function Login({
  onAuthenticated,
}: {
  onAuthenticated: (session: Session) => void;
}) {
  const [email, setEmail] = useState('operator@tapak.local');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const session = await api.login(email, password);
      if (session.actor.role !== 'OPERATOR')
        throw new Error('Use an operator account here.');
      onAuthenticated(session);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Sign in failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-shell">
      <section className="login-story">
        <Brand />
        <p className="eyebrow">PARCEL OPERATIONS</p>
        <h1>The package moved. The proof moved with it.</h1>
        <p>
          Create a journey, assign a courier, and watch each verified handoff reach the
          operations desk without losing its history.
        </p>
        <div className="route-visual" aria-hidden="true">
          <i /> <span>Assigned</span> <i /> <span>In transit</span> <i />{' '}
          <span>Delivered</span>
        </div>
      </section>
      <section className="login-panel">
        <div>
          <p className="eyebrow">OPERATOR ACCESS</p>
          <h2>Open the operations desk</h2>
          <p className="muted">Use the local credentials created during setup.</p>
        </div>
        <form onSubmit={submit}>
          <label>
            Email
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
            />
          </label>
          <label>
            Password
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              minLength={10}
            />
          </label>
          {error && <p className="alert alert--error">{error}</p>}
          <button className="button button--primary" disabled={busy}>
            {busy ? 'Opening…' : 'Open console'}
          </button>
        </form>
      </section>
    </main>
  );
}
