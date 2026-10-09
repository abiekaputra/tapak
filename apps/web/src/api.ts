// Module responsible for typed communication with the Tapak API.
import type { Actor, CreateParcelInput, Parcel, Session } from '@tapak/contracts';

const baseUrl = import.meta.env.VITE_TAPAK_API_URL ?? 'http://127.0.0.1:4100';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const body: unknown = await response.json();
  if (!response.ok) {
    const message =
      typeof body === 'object' &&
      body &&
      'message' in body &&
      typeof body.message === 'string'
        ? body.message
        : 'Request failed.';
    throw new ApiError(message, response.status);
  }
  return body as T;
}

export const api = {
  login: (email: string, password: string) =>
    request<Session>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  couriers: (token: string) => request<Actor[]>('/api/couriers', {}, token),
  parcels: (token: string) => request<Parcel[]>('/api/parcels', {}, token),
  audit: (token: string) => request<AuditEntry[]>('/api/audit', {}, token),
  createParcel: (input: CreateParcelInput, token: string) =>
    request<Parcel>(
      '/api/parcels',
      { method: 'POST', body: JSON.stringify(input) },
      token,
    ),
  subscribe: async (token: string, onChange: () => void, signal: AbortSignal) => {
    const response = await fetch(`${baseUrl}/api/stream`, {
      headers: { Authorization: `Bearer ${token}` },
      signal,
    });
    if (!response.body) return;
    const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
    while (!signal.aborted) {
      const { value, done } = await reader.read();
      if (done) return;
      if (value.includes('event: parcel')) onChange();
    }
  },
};

export interface AuditEntry {
  action: string;
  entityId: string;
  detail: string;
  occurredAt: string;
  actorName: string;
}
