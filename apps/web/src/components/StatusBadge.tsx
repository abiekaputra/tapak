// Module responsible for presenting parcel statuses consistently.
import type { ParcelStatus } from '@tapak/contracts';

const labels: Record<ParcelStatus, string> = {
  CREATED: 'Created',
  ASSIGNED: 'Assigned',
  PICKED_UP: 'Picked up',
  IN_TRANSIT: 'In transit',
  DELIVERED: 'Delivered',
};

export function StatusBadge({ status }: { status: ParcelStatus }) {
  return (
    <span className={`status status--${status.toLowerCase()}`}>{labels[status]}</span>
  );
}
