// Module responsible for exposing authenticated Tapak HTTP workflows.
import type { FastifyInstance } from 'fastify';

import { createParcelSchema, journeyEventSchema, loginSchema } from '@tapak/contracts';

import { authenticate, requireRole, signActor } from './auth.js';
import type { ChangeHub } from './change-hub.js';
import type { TapakRepository } from './repository.js';
import { toActor } from './rows.js';
import { verifyPassword } from './security.js';

export function registerRoutes(
  app: FastifyInstance,
  repository: TapakRepository,
  changes: ChangeHub,
) {
  app.get('/health', async () => ({ status: 'ok' }));

  app.post('/api/auth/login', async (request, reply) => {
    const input = loginSchema.parse(request.body);
    const row = repository.findActorByEmail(input.email.toLowerCase());
    if (!row || !verifyPassword(input.password, row.password_salt, row.password_hash)) {
      return reply.code(401).send({ message: 'Email or password is incorrect.' });
    }
    const actor = toActor(row);
    return { actor, token: signActor(app, actor) };
  });

  app.get('/api/me', { preHandler: authenticate }, async (request) => request.actor);
  app.get('/api/couriers', { preHandler: requireRole('OPERATOR') }, async () =>
    repository.listCouriers(),
  );

  app.get('/api/parcels', { preHandler: authenticate }, async (request) =>
    repository.listParcels(request.actor),
  );

  app.get(
    '/api/parcels/code/:code',
    { preHandler: authenticate },
    async (request, reply) => {
      const { code } = request.params as { code: string };
      const parcel = repository.findParcelByCode(code);
      if (!parcel) return reply.code(404).send({ message: 'Parcel code was not found.' });
      if (request.actor.role === 'COURIER' && parcel.courierId !== request.actor.id) {
        return reply
          .code(403)
          .send({ message: 'This parcel is assigned to another courier.' });
      }
      return parcel;
    },
  );

  app.post(
    '/api/parcels',
    { preHandler: requireRole('OPERATOR') },
    async (request, reply) => {
      const parcel = repository.createParcel(
        createParcelSchema.parse(request.body),
        request.actor.id,
      );
      changes.publish(parcel.id);
      return reply.code(201).send(parcel);
    },
  );

  app.post(
    '/api/parcels/:id/events',
    { preHandler: requireRole('COURIER') },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const parcel = repository.getParcel(id);
      if (!parcel) return reply.code(404).send({ message: 'Parcel was not found.' });
      if (parcel.courierId !== request.actor.id) {
        return reply
          .code(403)
          .send({ message: 'This parcel is assigned to another courier.' });
      }
      const updated = repository.recordEvent(
        parcel,
        journeyEventSchema.parse(request.body),
        request.actor,
      );
      changes.publish(updated.id);
      return updated;
    },
  );

  app.get('/api/audit', { preHandler: requireRole('OPERATOR') }, async () =>
    repository.listAudit(),
  );

  app.get(
    '/api/stream',
    { preHandler: requireRole('OPERATOR') },
    async (request, reply) => {
      reply.hijack();
      reply.raw.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      });
      reply.raw.write('event: ready\ndata: connected\n\n');
      const unsubscribe = changes.subscribe((parcelId) => {
        reply.raw.write(`event: parcel\ndata: ${parcelId}\n\n`);
      });
      request.raw.on('close', unsubscribe);
    },
  );
}
