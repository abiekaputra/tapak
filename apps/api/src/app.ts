// Module responsible for composing the Tapak API and its infrastructure.
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import Fastify, { LogController } from 'fastify';
import { ZodError } from 'zod';

import { InvalidJourneyTransitionError } from '@tapak/domain';

import { ChangeHub } from './change-hub.js';
import type { ApiConfig } from './config.js';
import { openDatabase } from './database.js';
import { TapakRepository } from './repository.js';
import { registerRoutes } from './routes.js';
import './types.js';

export async function buildApp(config: ApiConfig) {
  const app = Fastify({
    logController: new LogController({
      disableRequestLogging: true,
      requestIdLogLabel: 'correlation_id',
    }),
    logger: {
      level: config.environment === 'test' ? 'silent' : config.logLevel,
      base: { logger: 'tapak-api', correlation_id: 'system' },
      redact: ['req.headers.authorization'],
      timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
    },
    genReqId: (request) => String(request.headers['x-request-id'] ?? crypto.randomUUID()),
  });
  const database = openDatabase(config);
  const repository = new TapakRepository(database);
  repository.seedActors(config);

  await app.register(cors, { origin: [config.webOrigin, config.mobileWebOrigin] });
  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(jwt, { secret: config.jwtSecret });
  registerRoutes(app, repository, new ChangeHub());

  app.addHook('onRequest', async (request) => {
    if (request.url !== '/health') request.log.info({ event: 'request_started' });
  });
  app.addHook('onResponse', async (request, reply) => {
    if (request.url !== '/health') {
      request.log.info({ event: 'request_completed', status_code: reply.statusCode });
    }
  });

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      return reply.code(422).send({
        message: 'Please correct the highlighted fields.',
        issues: error.issues,
      });
    }
    if (error instanceof InvalidJourneyTransitionError) {
      return reply.code(409).send({ message: error.message });
    }
    const failure =
      error instanceof Error ? error : new Error('Unknown request failure.');
    const statusCode = 'statusCode' in failure ? Number(failure.statusCode) : 500;
    if (statusCode >= 500) request.log.error({ err: error, event: 'request_failed' });
    return reply.code(statusCode).send({
      message:
        statusCode >= 500 ? 'Tapak could not complete the request.' : failure.message,
    });
  });

  app.addHook('onClose', async () => database.close());
  return app;
}
