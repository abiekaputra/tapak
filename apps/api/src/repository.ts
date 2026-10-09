// Module responsible for persisting actors, parcels, journey events, and audits.
import { randomUUID } from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';

import type {
  Actor,
  CreateParcelInput,
  JourneyEventInput,
  Parcel,
} from '@tapak/contracts';
import { nextParcelStatus } from '@tapak/domain';

import type { ApiConfig } from './config.js';
import type { ActorRow, EventRow, ParcelRow } from './rows.js';
import { toActor, toEvent, toParcel } from './rows.js';
import { hashPassword } from './security.js';

export class TapakRepository {
  constructor(private readonly database: DatabaseSync) {}

  seedActors(config: ApiConfig) {
    const actors = [
      {
        id: '6b11cace-74f8-4fdc-a76c-24e7dc82e501',
        name: 'Raka Operator',
        email: 'operator@tapak.local',
        role: 'OPERATOR',
        password: config.operatorPassword,
      },
      {
        id: '489c18fc-cbb9-45dd-adf8-f538cf197cda',
        name: 'Dini Kurir',
        email: 'courier@tapak.local',
        role: 'COURIER',
        password: config.courierPassword,
      },
    ] as const;
    const statement = this.database.prepare(`
      INSERT INTO actors (id,name,email,role,password_salt,password_hash)
      VALUES (?,?,?,?,?,?)
      ON CONFLICT(email) DO UPDATE SET name=excluded.name, role=excluded.role,
        password_salt=excluded.password_salt, password_hash=excluded.password_hash
    `);
    for (const actor of actors) {
      const password = hashPassword(actor.password);
      statement.run(
        actor.id,
        actor.name,
        actor.email,
        actor.role,
        password.salt,
        password.hash,
      );
    }
  }

  findActorByEmail(email: string) {
    return this.database.prepare('SELECT * FROM actors WHERE email = ?').get(email) as
      ActorRow | undefined;
  }

  listCouriers(): Actor[] {
    const rows = this.database
      .prepare("SELECT * FROM actors WHERE role = 'COURIER' ORDER BY name")
      .all() as unknown as ActorRow[];
    return rows.map(toActor);
  }

  createParcel(input: CreateParcelInput, actorId: string): Parcel {
    const id = randomUUID();
    const timestamp = new Date().toISOString();
    const code = `TPK-${randomUUID().slice(0, 8).toUpperCase()}`;
    this.database
      .prepare(
        `INSERT INTO parcels
        (id,code,recipient_name,recipient_address,recipient_phone,courier_id,status,created_at,updated_at)
        VALUES (?,?,?,?,?,?,'ASSIGNED',?,?)`,
      )
      .run(
        id,
        code,
        input.recipientName,
        input.recipientAddress,
        input.recipientPhone,
        input.courierId,
        timestamp,
        timestamp,
      );
    this.audit(actorId, 'PARCEL_CREATED', id, code);
    return this.getParcel(id) as Parcel;
  }

  listParcels(actor: Actor): Parcel[] {
    const query = `${this.parcelQuery()} ${actor.role === 'COURIER' ? 'WHERE p.courier_id = ?' : ''} ORDER BY p.updated_at DESC`;
    const rows = (actor.role === 'COURIER'
      ? this.database.prepare(query).all(actor.id)
      : this.database.prepare(query).all()) as unknown as ParcelRow[];
    return rows.map((row) => toParcel(row, this.listEvents(row.id)));
  }

  getParcel(id: string): Parcel | undefined {
    const row = this.database.prepare(`${this.parcelQuery()} WHERE p.id = ?`).get(id) as
      ParcelRow | undefined;
    return row ? toParcel(row, this.listEvents(row.id)) : undefined;
  }

  findParcelByCode(code: string) {
    const row = this.database
      .prepare(`${this.parcelQuery()} WHERE UPPER(p.code) = UPPER(?)`)
      .get(code) as ParcelRow | undefined;
    return row ? toParcel(row, this.listEvents(row.id)) : undefined;
  }

  recordEvent(parcel: Parcel, input: JourneyEventInput, actor: Actor): Parcel {
    const existing = this.database
      .prepare('SELECT parcel_id FROM journey_events WHERE idempotency_key = ?')
      .get(input.idempotencyKey) as { parcel_id: string } | undefined;
    if (existing) return this.getParcel(existing.parcel_id) as Parcel;

    const nextStatus = nextParcelStatus(parcel.status, input.type);
    const id = randomUUID();
    const timestamp = new Date().toISOString();
    this.database.exec('BEGIN IMMEDIATE');
    try {
      this.database
        .prepare(
          `INSERT INTO journey_events
          (id,parcel_id,actor_id,idempotency_key,type,latitude,longitude,accuracy_meters,
           recipient_name,note,captured_at,recorded_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        )
        .run(
          id,
          parcel.id,
          actor.id,
          input.idempotencyKey,
          input.type,
          input.coordinates.latitude,
          input.coordinates.longitude,
          input.coordinates.accuracyMeters ?? null,
          input.recipientName ?? null,
          input.note ?? null,
          input.capturedAt,
          timestamp,
        );
      this.database
        .prepare(
          'UPDATE parcels SET status=?, version=version+1, updated_at=? WHERE id=?',
        )
        .run(nextStatus, timestamp, parcel.id);
      this.audit(actor.id, `JOURNEY_${input.type}`, parcel.id, input.idempotencyKey);
      this.database.exec('COMMIT');
    } catch (error) {
      this.database.exec('ROLLBACK');
      throw error;
    }
    return this.getParcel(parcel.id) as Parcel;
  }

  listAudit() {
    return this.database
      .prepare(
        `SELECT a.action,a.entity_id AS entityId,a.detail,a.occurred_at AS occurredAt,
        u.name AS actorName FROM audit_events a JOIN actors u ON u.id=a.actor_id
        ORDER BY a.occurred_at DESC LIMIT 100`,
      )
      .all();
  }

  private listEvents(parcelId: string) {
    const rows = this.database
      .prepare('SELECT * FROM journey_events WHERE parcel_id=? ORDER BY recorded_at')
      .all(parcelId) as unknown as EventRow[];
    return rows.map(toEvent);
  }

  private audit(actorId: string, action: string, entityId: string, detail: string) {
    this.database
      .prepare('INSERT INTO audit_events VALUES (?,?,?,?,?,?)')
      .run(randomUUID(), actorId, action, entityId, detail, new Date().toISOString());
  }

  private parcelQuery() {
    return `SELECT p.*, a.name AS courier_name FROM parcels p
      JOIN actors a ON a.id = p.courier_id`;
  }
}
