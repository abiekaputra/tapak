// Module responsible for collecting and validating new parcel assignments.
import { useState, type FormEvent } from 'react';

import type { Actor, CreateParcelInput } from '@tapak/contracts';

const initial = {
  recipientName: '',
  recipientAddress: '',
  recipientPhone: '',
  courierId: '',
};

export function CreateParcel({
  couriers,
  onCreate,
  onCancel,
}: {
  couriers: Actor[];
  onCreate: (input: CreateParcelInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({ ...initial, courierId: couriers[0]?.id ?? '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function update(field: keyof CreateParcelInput, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await onCreate(form);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Parcel could not be created.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="sheet" aria-labelledby="create-title">
      <div className="sheet__header">
        <div>
          <p className="eyebrow">NEW JOURNEY</p>
          <h2 id="create-title">Assign a traceable parcel</h2>
        </div>
        <button className="button button--quiet" onClick={onCancel}>
          Cancel
        </button>
      </div>
      <form className="form-grid" onSubmit={submit}>
        <label>
          Recipient name
          <input
            required
            minLength={2}
            value={form.recipientName}
            onChange={(e) => update('recipientName', e.target.value)}
          />
        </label>
        <label>
          Phone
          <input
            required
            value={form.recipientPhone}
            onChange={(e) => update('recipientPhone', e.target.value)}
            placeholder="+628123456789"
          />
        </label>
        <label className="form-grid__wide">
          Delivery address
          <textarea
            required
            minLength={8}
            value={form.recipientAddress}
            onChange={(e) => update('recipientAddress', e.target.value)}
          />
        </label>
        <label className="form-grid__wide">
          Courier
          <select
            value={form.courierId}
            onChange={(e) => update('courierId', e.target.value)}
          >
            {couriers.map((courier) => (
              <option key={courier.id} value={courier.id}>
                {courier.name}
              </option>
            ))}
          </select>
        </label>
        {error && <p className="alert alert--error form-grid__wide">{error}</p>}
        <button className="button button--primary" disabled={busy}>
          {busy ? 'Creating…' : 'Create and assign'}
        </button>
      </form>
    </section>
  );
}
