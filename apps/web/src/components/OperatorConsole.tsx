// Module responsible for coordinating the live Tapak operator workspace.
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { Actor, CreateParcelInput, Parcel, Session } from '@tapak/contracts';

import { api } from '../api';
import { Brand } from './Brand';
import { CreateParcel } from './CreateParcel';
import { ParcelDetail } from './ParcelDetail';
import { StatusBadge } from './StatusBadge';

export function OperatorConsole({
  session,
  onSignOut,
}: {
  session: Session;
  onSignOut: () => void;
}) {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [couriers, setCouriers] = useState<Actor[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      setParcels(await api.parcels(session.token));
      setError('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Workspace could not refresh.');
    }
  }, [session.token]);

  useEffect(() => {
    void Promise.all([refresh(), api.couriers(session.token).then(setCouriers)]);
    const controller = new AbortController();
    const fallback = window.setInterval(() => void refresh(), 10_000);
    void api.subscribe(session.token, refresh, controller.signal).catch(() => undefined);
    return () => {
      controller.abort();
      window.clearInterval(fallback);
    };
  }, [refresh, session.token]);

  const selected = parcels.find((parcel) => parcel.id === selectedId);
  const totals = useMemo(
    () => ({
      active: parcels.filter((parcel) => parcel.status !== 'DELIVERED').length,
      transit: parcels.filter((parcel) => parcel.status === 'IN_TRANSIT').length,
      delivered: parcels.filter((parcel) => parcel.status === 'DELIVERED').length,
    }),
    [parcels],
  );

  async function create(input: CreateParcelInput) {
    const parcel = await api.createParcel(input, session.token);
    await refresh();
    setCreating(false);
    setSelectedId(parcel.id);
  }

  if (creating)
    return (
      <CreateParcel
        couriers={couriers}
        onCreate={create}
        onCancel={() => setCreating(false)}
      />
    );
  if (selected)
    return <ParcelDetail parcel={selected} onClose={() => setSelectedId(undefined)} />;

  return (
    <div className="console-shell">
      <header className="topbar">
        <Brand compact />
        <div className="topbar__user">
          <span>
            {session.actor.name}
            <small>Operator</small>
          </span>
          <button className="button button--quiet" onClick={onSignOut}>
            Sign out
          </button>
        </div>
      </header>
      <main className="workspace">
        <section className="workspace__heading">
          <div>
            <p className="eyebrow">LIVE OPERATIONS</p>
            <h1>Every parcel, one accountable trail.</h1>
            <p className="muted">
              Changes recorded by couriers appear here as they happen.
            </p>
          </div>
          <button className="button button--primary" onClick={() => setCreating(true)}>
            New parcel
          </button>
        </section>
        {error && <p className="alert alert--error">{error}</p>}
        <section className="metric-grid">
          <article>
            <span>Active journeys</span>
            <strong>{totals.active}</strong>
          </article>
          <article>
            <span>In transit</span>
            <strong>{totals.transit}</strong>
          </article>
          <article>
            <span>Delivered</span>
            <strong>{totals.delivered}</strong>
          </article>
        </section>
        <section className="parcel-board">
          <div className="section-title">
            <div>
              <p className="eyebrow">PARCEL BOARD</p>
              <h2>Latest movement</h2>
            </div>
            <button className="button button--quiet" onClick={() => void refresh()}>
              Refresh
            </button>
          </div>
          {parcels.length === 0 ? (
            <div className="empty">
              <img src="/tapak-mark.png" alt="" />
              <h3>No trail yet</h3>
              <p>Create the first parcel and assign its journey to a courier.</p>
              <button
                className="button button--primary"
                onClick={() => setCreating(true)}
              >
                Create first parcel
              </button>
            </div>
          ) : (
            <div className="parcel-list">
              {parcels.map((parcel) => (
                <button
                  className="parcel-row"
                  key={parcel.id}
                  onClick={() => setSelectedId(parcel.id)}
                >
                  <span className="parcel-row__route">
                    <i />
                    {parcel.code}
                  </span>
                  <span>
                    <strong>{parcel.recipientName}</strong>
                    <small>{parcel.recipientAddress}</small>
                  </span>
                  <span>
                    <strong>{parcel.courierName}</strong>
                    <small>{parcel.events.length} evidence points</small>
                  </span>
                  <StatusBadge status={parcel.status} />
                  <b aria-hidden="true">→</b>
                </button>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
