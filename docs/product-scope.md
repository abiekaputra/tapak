# Product scope

## Product promise

Tapak preserves an explainable parcel trail from assignment through delivery, including when
the courier briefly loses connectivity.

## Users

- **Operator:** creates parcels, assigns a courier, produces scan labels, and reviews live
  journey evidence.
- **Courier:** scans assigned parcels and records pickup, transit, and delivery with the
  device's current location.

## Release flows

### Operator

1. Sign in with an operator account.
2. Create a parcel with synthetic recipient contact data.
3. Assign the courier and obtain the QR label.
4. Watch state and evidence change as the courier works.
5. Inspect the recipient name and coordinates on completion.

### Courier

1. Sign in through Expo Go.
2. Browse assigned parcels or scan a label.
3. Record pickup, optional transit checkpoints, and delivery.
4. Continue recording while offline.
5. Reconnect and let Tapak replay queued events exactly once.

## Acceptance criteria

- Each parcel code is unique and resolves only for its assigned courier or an operator.
- The API rejects delivery before pickup and rejects events after delivery.
- Delivery requires a recipient name.
- Every event includes capture time and valid coordinates.
- Replaying one idempotency key returns the original parcel without another event.
- A courier cannot read or mutate another courier's assignment.
- An offline event survives application storage and updates the local timeline immediately.
- Reconnection replays pending events in their captured order.
- The operator can inspect all evidence after delivery.
- Android, iOS, and web bundles export successfully.

## Excluded from this release

Carrier integrations, public hosting, real recipient data, background location, photographs,
recipient signatures, push notifications, route optimization, billing, and legal delivery
certification are not implemented or claimed.
