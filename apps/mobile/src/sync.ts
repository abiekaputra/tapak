// Module responsible for idempotently synchronizing offline journey evidence.
import type { Parcel } from '@tapak/contracts';

import { api } from './api';
import { storage, type PendingEvent } from './storage';

export async function enqueue(event: PendingEvent) {
  const queue = await storage.queue();
  if (!queue.some((item) => item.input.idempotencyKey === event.input.idempotencyKey)) {
    await storage.saveQueue([...queue, event]);
  }
}

export async function flushQueue(token: string) {
  const queue = await storage.queue();
  const remaining: PendingEvent[] = [];
  const updated = new Map<string, Parcel>();
  for (const event of queue) {
    try {
      updated.set(
        event.parcelId,
        await api.recordEvent(event.parcelId, event.input, token),
      );
    } catch {
      remaining.push(event);
    }
  }
  await storage.saveQueue(remaining);
  return { remaining, updated: [...updated.values()] };
}
