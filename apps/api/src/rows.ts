// Module responsible for mapping SQLite rows into shared Tapak contracts.
import type { Actor, JourneyEvent, Parcel, Role } from '@tapak/contracts';

export interface ActorRow {
  id: string;
  name: string;
  email: string;
  role: Role;
  password_salt: string;
  password_hash: string;
}

export interface ParcelRow {
  id: string;
  code: string;
  recipient_name: string;
  recipient_address: string;
  recipient_phone: string;
  courier_id: string;
  courier_name: string;
  status: Parcel['status'];
  version: number;
  created_at: string;
  updated_at: string;
}

export interface EventRow {
  id: string;
  parcel_id: string;
  type: JourneyEvent['type'];
  latitude: number;
  longitude: number;
  accuracy_meters: number | null;
  recipient_name: string | null;
  note: string | null;
  captured_at: string;
  recorded_at: string;
}

export function toActor(row: ActorRow): Actor {
  return { id: row.id, name: row.name, email: row.email, role: row.role };
}

export function toEvent(row: EventRow): JourneyEvent {
  return {
    id: row.id,
    parcelId: row.parcel_id,
    type: row.type,
    coordinates: {
      latitude: row.latitude,
      longitude: row.longitude,
      ...(row.accuracy_meters ? { accuracyMeters: row.accuracy_meters } : {}),
    },
    ...(row.recipient_name ? { recipientName: row.recipient_name } : {}),
    ...(row.note ? { note: row.note } : {}),
    capturedAt: row.captured_at,
    recordedAt: row.recorded_at,
  };
}

export function toParcel(row: ParcelRow, events: JourneyEvent[]): Parcel {
  return {
    id: row.id,
    code: row.code,
    recipientName: row.recipient_name,
    recipientAddress: row.recipient_address,
    recipientPhone: row.recipient_phone,
    courierId: row.courier_id,
    courierName: row.courier_name,
    status: row.status,
    version: row.version,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    events,
  };
}
