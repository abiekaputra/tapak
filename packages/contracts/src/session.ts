// Module responsible for defining authentication and actor contracts.
import { z } from 'zod';

export const roleSchema = z.enum(['OPERATOR', 'COURIER']);
export const loginSchema = z.object({
  email: z.string().email().max(160),
  password: z.string().min(10).max(128),
});

export type Role = z.infer<typeof roleSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export interface Actor {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Session {
  token: string;
  actor: Actor;
}
