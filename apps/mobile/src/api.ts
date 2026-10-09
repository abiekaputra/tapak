// Module responsible for typed mobile communication with the Tapak API.
import type { JourneyEventInput, Parcel, Session } from '@tapak/contracts';

const baseUrl = process.env.EXPO_PUBLIC_TAPAK_API_URL ?? 'http://127.0.0.1:4100';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}, token?: string) {
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
  parcels: (token: string) => request<Parcel[]>('/api/parcels', {}, token),
  findByCode: (code: string, token: string) =>
    request<Parcel>(`/api/parcels/code/${encodeURIComponent(code)}`, {}, token),
  recordEvent: (parcelId: string, input: JourneyEventInput, token: string) =>
    request<Parcel>(
      `/api/parcels/${parcelId}/events`,
      { method: 'POST', body: JSON.stringify(input) },
      token,
    ),
};
