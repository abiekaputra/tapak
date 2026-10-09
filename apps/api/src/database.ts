// Module responsible for creating and migrating the local SQLite database.
import { mkdirSync, rmSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

import type { ApiConfig } from './config.js';

const schema = `
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS actors (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK(role IN ('OPERATOR','COURIER')),
    password_salt TEXT NOT NULL, password_hash TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS parcels (
    id TEXT PRIMARY KEY, code TEXT NOT NULL UNIQUE, recipient_name TEXT NOT NULL,
    recipient_address TEXT NOT NULL, recipient_phone TEXT NOT NULL,
    courier_id TEXT NOT NULL REFERENCES actors(id), status TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS journey_events (
    id TEXT PRIMARY KEY, parcel_id TEXT NOT NULL REFERENCES parcels(id),
    actor_id TEXT NOT NULL REFERENCES actors(id), idempotency_key TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL, latitude REAL NOT NULL, longitude REAL NOT NULL,
    accuracy_meters REAL, recipient_name TEXT, note TEXT,
    captured_at TEXT NOT NULL, recorded_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS audit_events (
    id TEXT PRIMARY KEY, actor_id TEXT NOT NULL REFERENCES actors(id),
    action TEXT NOT NULL, entity_id TEXT NOT NULL, detail TEXT NOT NULL,
    occurred_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_parcels_courier ON parcels(courier_id, updated_at DESC);
  CREATE INDEX IF NOT EXISTS idx_events_parcel ON journey_events(parcel_id, recorded_at);
`;

export function openDatabase(config: ApiConfig) {
  if (config.resetDatabase) rmSync(config.databasePath, { force: true });
  mkdirSync(dirname(config.databasePath), { recursive: true });
  const database = new DatabaseSync(config.databasePath);
  database.exec(schema);
  return database;
}
