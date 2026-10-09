# HTTP API

The local API listens on port `4100`. All `/api` routes except login require a Bearer JWT.

| Method | Route                     | Role             | Purpose                                                            |
| ------ | ------------------------- | ---------------- | ------------------------------------------------------------------ |
| `GET`  | `/health`                 | Public           | Process readiness                                                  |
| `POST` | `/api/auth/login`         | Public           | Exchange local credentials for an eight-hour token                 |
| `GET`  | `/api/me`                 | Any              | Read the authenticated actor                                       |
| `GET`  | `/api/couriers`           | Operator         | List assignable couriers                                           |
| `GET`  | `/api/parcels`            | Any              | List all parcels for an operator or assigned parcels for a courier |
| `GET`  | `/api/parcels/code/:code` | Any              | Resolve one authorized parcel code                                 |
| `POST` | `/api/parcels`            | Operator         | Create and assign a parcel                                         |
| `POST` | `/api/parcels/:id/events` | Assigned courier | Record an idempotent journey event                                 |
| `GET`  | `/api/audit`              | Operator         | Review the latest 100 privileged changes                           |
| `GET`  | `/api/stream`             | Operator         | Receive authenticated parcel-change SSE events                     |

Validation errors return `422`, authorization failures return `403`, illegal transitions return
`409`, and unavailable resources return `404`. Unexpected failures return one generic message;
the API logs a correlation identifier without authorization headers or parcel contact values.
