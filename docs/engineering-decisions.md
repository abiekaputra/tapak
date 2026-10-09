# Engineering decisions

## Expo instead of separate native clients

Tapak needs camera, location, durable device storage, and network awareness without maintaining
two UI implementations. Expo provides those device boundaries inside Expo Go while React Native
keeps the courier experience shared. Android and iOS bundles are exported separately so web
preview success is not mistaken for native compatibility.

## SQLite for a local product

The portfolio release has one local operations desk and does not need a database server. Node's
built-in SQLite driver supplies transactions, constraints, indexes, and WAL durability without
native package installation. The repository class isolates SQL so hosted PostgreSQL remains a
future implementation choice rather than a current claim.

## Explicit state machine

Status is not accepted from either client. The domain maps a journey event to its legal next
state. This prevents a UI bug or forged request from delivering an assigned parcel, returning a
delivered parcel to transit, or adding evidence after completion.

## Idempotency at the database boundary

Mobile connectivity can fail after the API commits but before the response returns. Every event
therefore carries a client-created UUID with a unique database constraint. Repeating the event
returns the existing parcel instead of duplicating evidence.

## Coordinates instead of intrusive proof

The release records device coordinates, capture time, and recipient name. Photos and signatures
would introduce sensitive biometric and image data without adding necessary engineering evidence
for this scope, so they remain excluded.
