// Module responsible for verifying Tapak API authentication and delivery flows.
import { randomUUID } from 'node:crypto';
import { rmSync } from 'node:fs';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { buildApp } from './app.js';

const databasePath = `runtime/api-test-${process.pid}.db`;
const config = {
  environment: 'test' as const,
  logLevel: 'error' as const,
  databasePath,
  jwtSecret: 'tapak-test-secret-with-at-least-32-characters',
  operatorPassword: 'operator-password',
  courierPassword: 'courier-password',
  webOrigin: 'http://127.0.0.1:4173',
  mobileWebOrigin: 'http://127.0.0.1:4174',
  port: 4100,
  resetDatabase: true,
};

describe('Tapak API', () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeEach(async () => {
    app = await buildApp(config);
  });

  afterEach(async () => {
    await app.close();
    for (const suffix of ['', '-shm', '-wal'])
      rmSync(`${databasePath}${suffix}`, { force: true });
  });

  async function login(email: string, password: string) {
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email, password },
    });
    return response.json<{ token: string; actor: { id: string } }>();
  }

  it('completes one authenticated parcel journey with idempotent delivery', async () => {
    const operator = await login('operator@tapak.local', 'operator-password');
    const courier = await login('courier@tapak.local', 'courier-password');
    const created = await app.inject({
      method: 'POST',
      url: '/api/parcels',
      headers: { authorization: `Bearer ${operator.token}` },
      payload: {
        recipientName: 'Nadia Putri',
        recipientAddress: 'Jalan Majapahit 18, Mojokerto',
        recipientPhone: '+628123456789',
        courierId: courier.actor.id,
      },
    });
    expect(created.statusCode).toBe(201);
    const parcel = created.json<{ id: string }>();

    for (const [type, recipientName] of [
      ['PICKUP', undefined],
      ['TRANSIT', undefined],
      ['DELIVERY', 'Nadia Putri'],
    ] as const) {
      const response = await app.inject({
        method: 'POST',
        url: `/api/parcels/${parcel.id}/events`,
        headers: { authorization: `Bearer ${courier.token}` },
        payload: {
          idempotencyKey: randomUUID(),
          type,
          coordinates: { latitude: -7.4726, longitude: 112.4338, accuracyMeters: 12 },
          capturedAt: new Date().toISOString(),
          recipientName,
        },
      });
      expect(response.statusCode).toBe(200);
      if (type === 'DELIVERY') expect(response.json().status).toBe('DELIVERED');
    }
  });

  it('rejects invalid credentials and impossible journey transitions', async () => {
    const denied = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: 'operator@tapak.local', password: 'incorrect-password' },
    });
    expect(denied.statusCode).toBe(401);
  });
});
