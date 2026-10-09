// Module responsible for enforcing valid parcel journey transitions.
import type { JourneyEventType, ParcelStatus } from '@tapak/contracts';

const transitions: Record<
  ParcelStatus,
  Partial<Record<JourneyEventType, ParcelStatus>>
> = {
  CREATED: {},
  ASSIGNED: { PICKUP: 'PICKED_UP' },
  PICKED_UP: { TRANSIT: 'IN_TRANSIT', DELIVERY: 'DELIVERED' },
  IN_TRANSIT: { TRANSIT: 'IN_TRANSIT', DELIVERY: 'DELIVERED' },
  DELIVERED: {},
};

export class InvalidJourneyTransitionError extends Error {
  constructor(status: ParcelStatus, event: JourneyEventType) {
    super(`${event} cannot be recorded while a parcel is ${status}.`);
    this.name = 'InvalidJourneyTransitionError';
  }
}

export function nextParcelStatus(
  current: ParcelStatus,
  event: JourneyEventType,
): ParcelStatus {
  const next = transitions[current]?.[event];
  if (!next) throw new InvalidJourneyTransitionError(current, event);
  return next;
}

export function availableJourneyEvents(status: ParcelStatus): JourneyEventType[] {
  return Object.keys(transitions[status] ?? {}) as JourneyEventType[];
}
