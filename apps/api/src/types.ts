// Module responsible for extending Fastify with authenticated Tapak actors.
import type { Actor } from '@tapak/contracts';

declare module 'fastify' {
  interface FastifyRequest {
    actor: Actor;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: Actor;
    user: Actor;
  }
}
