// Module responsible for authenticating requests and enforcing Tapak roles.
import type { FastifyInstance, FastifyRequest } from 'fastify';

import type { Actor, Role } from '@tapak/contracts';

export async function authenticate(request: FastifyRequest) {
  await request.jwtVerify<Actor>();
  request.actor = request.user;
}

export function requireRole(role: Role) {
  return async (request: FastifyRequest) => {
    await authenticate(request);
    if (request.actor.role !== role) {
      const error = new Error('This action is not available for your role.');
      Object.assign(error, { statusCode: 403 });
      throw error;
    }
  };
}

export function signActor(app: FastifyInstance, actor: Actor) {
  return app.jwt.sign(actor, { expiresIn: '8h' });
}
