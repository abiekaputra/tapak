// Module responsible for verifying parcel journey state transitions.
import { describe, expect, it } from 'vitest';

import {
  InvalidJourneyTransitionError,
  availableJourneyEvents,
  nextParcelStatus,
} from './journey.js';

describe('parcel journey', () => {
  it('moves an assigned parcel through pickup, transit, and delivery', () => {
    expect(nextParcelStatus('ASSIGNED', 'PICKUP')).toBe('PICKED_UP');
    expect(nextParcelStatus('PICKED_UP', 'TRANSIT')).toBe('IN_TRANSIT');
    expect(nextParcelStatus('IN_TRANSIT', 'DELIVERY')).toBe('DELIVERED');
  });

  it('allows direct delivery after pickup and repeated transit checkpoints', () => {
    expect(nextParcelStatus('PICKED_UP', 'DELIVERY')).toBe('DELIVERED');
    expect(nextParcelStatus('IN_TRANSIT', 'TRANSIT')).toBe('IN_TRANSIT');
  });

  it('rejects impossible events and exposes the next choices', () => {
    expect(() => nextParcelStatus('ASSIGNED', 'DELIVERY')).toThrow(
      InvalidJourneyTransitionError,
    );
    expect(availableJourneyEvents('ASSIGNED')).toEqual(['PICKUP']);
    expect(availableJourneyEvents('DELIVERED')).toEqual([]);
  });
});
