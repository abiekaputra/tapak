// Module responsible for presenting one parcel's complete traceable journey.
import type { Parcel } from '@tapak/contracts';
import QRCode from 'react-qr-code';

import { StatusBadge } from './StatusBadge';

const eventLabels = {
  PICKUP: 'Collected from sender',
  TRANSIT: 'Transit checkpoint',
  DELIVERY: 'Handed to recipient',
};

export function ParcelDetail({
  parcel,
  onClose,
}: {
  parcel: Parcel;
  onClose: () => void;
}) {
  return (
    <section className="sheet" aria-labelledby="parcel-title">
      <div className="sheet__header">
        <div>
          <p className="eyebrow">{parcel.code}</p>
          <h2 id="parcel-title">{parcel.recipientName}</h2>
        </div>
        <button className="button button--quiet" onClick={onClose}>
          Close
        </button>
      </div>
      <div className="detail-grid">
        <div>
          <span>Status</span>
          <StatusBadge status={parcel.status} />
        </div>
        <div>
          <span>Courier</span>
          <strong>{parcel.courierName}</strong>
        </div>
        <div>
          <span>Destination</span>
          <strong>{parcel.recipientAddress}</strong>
        </div>
        <div>
          <span>Contact</span>
          <strong>{parcel.recipientPhone}</strong>
        </div>
      </div>
      <div className="parcel-label">
        <QRCode bgColor="#fffdf8" fgColor="#142b36" size={118} value={parcel.code} />
        <div>
          <span>SCANNABLE PARCEL LABEL</span>
          <strong>{parcel.code}</strong>
          <small>Print or present this code to the assigned courier.</small>
        </div>
      </div>
      <div className="timeline">
        <h3>Journey evidence</h3>
        <article className="timeline__item timeline__item--origin">
          <i />
          <div>
            <strong>Parcel assigned</strong>
            <span>{formatTime(parcel.createdAt)}</span>
          </div>
        </article>
        {parcel.events.map((event) => (
          <article className="timeline__item" key={event.id}>
            <i />
            <div>
              <strong>{eventLabels[event.type]}</strong>
              <span>
                {formatTime(event.recordedAt)} · {event.coordinates.latitude.toFixed(4)},{' '}
                {event.coordinates.longitude.toFixed(4)}
              </span>
              {event.recipientName && <small>Received by {event.recipientName}</small>}
              {event.note && <small>{event.note}</small>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}
