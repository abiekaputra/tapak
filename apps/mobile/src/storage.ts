// Module responsible for persisting courier sessions, cached parcels, and pending work.
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { JourneyEventInput, Parcel, Session } from '@tapak/contracts';

export interface PendingEvent {
  parcelId: string;
  parcelCode: string;
  input: JourneyEventInput;
}

const keys = {
  session: 'tapak.mobile.session',
  parcels: 'tapak.mobile.parcels',
  queue: 'tapak.mobile.queue',
};

async function read<T>(key: string, fallback: T): Promise<T> {
  const value = await AsyncStorage.getItem(key);
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    await AsyncStorage.removeItem(key);
    return fallback;
  }
}

export const storage = {
  session: () => read<Session | null>(keys.session, null),
  saveSession: (session: Session | null) =>
    session
      ? AsyncStorage.setItem(keys.session, JSON.stringify(session))
      : AsyncStorage.removeItem(keys.session),
  parcels: () => read<Parcel[]>(keys.parcels, []),
  saveParcels: (parcels: Parcel[]) =>
    AsyncStorage.setItem(keys.parcels, JSON.stringify(parcels)),
  queue: () => read<PendingEvent[]>(keys.queue, []),
  saveQueue: (queue: PendingEvent[]) =>
    AsyncStorage.setItem(keys.queue, JSON.stringify(queue)),
};
