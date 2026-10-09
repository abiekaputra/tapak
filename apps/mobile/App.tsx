// Module responsible for coordinating Tapak courier navigation and synchronization.
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { StatusBar } from 'expo-status-bar';

import type { JourneyEventInput, Parcel, Session } from '@tapak/contracts';
import { nextParcelStatus } from '@tapak/domain';

import { api } from './src/api';
import { LoginScreen } from './src/screens/LoginScreen';
import { ParcelScreen } from './src/screens/ParcelScreen';
import { RouteScreen } from './src/screens/RouteScreen';
import { ScannerScreen } from './src/screens/ScannerScreen';
import { storage } from './src/storage';
import { enqueue, flushQueue } from './src/sync';

type Screen = 'route' | 'scanner' | 'parcel';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState<Screen>('route');
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [pendingCount, setPendingCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(
    async (activeSession = session) => {
      if (!activeSession) return;
      setRefreshing(true);
      try {
        const next = await api.parcels(activeSession.token);
        setParcels(next);
        await storage.saveParcels(next);
        const flushed = await flushQueue(activeSession.token);
        setPendingCount(flushed.remaining.length);
        if (flushed.updated.length) {
          const latest = await api.parcels(activeSession.token);
          setParcels(latest);
          await storage.saveParcels(latest);
        }
      } catch {
        setParcels(await storage.parcels());
        setPendingCount((await storage.queue()).length);
      } finally {
        setRefreshing(false);
      }
    },
    [session],
  );

  useEffect(() => {
    void (async () => {
      const stored = await storage.session();
      setSession(stored);
      setParcels(await storage.parcels());
      setPendingCount((await storage.queue()).length);
      setReady(true);
      if (stored) await refresh(stored);
    })();
  }, []);

  useEffect(
    () =>
      NetInfo.addEventListener((state) => {
        if (state.isConnected && session) void refresh(session);
      }),
    [refresh, session],
  );

  async function authenticated(next: Session) {
    await storage.saveSession(next);
    setSession(next);
    await refresh(next);
  }
  async function signOut() {
    await storage.saveSession(null);
    setSession(null);
    setParcels([]);
  }
  function open(parcel: Parcel) {
    setSelectedId(parcel.id);
    setScreen('parcel');
  }
  async function scan(code: string) {
    if (!session) return;
    try {
      open(await api.findByCode(code, session.token));
    } catch (reason) {
      Alert.alert(
        'Parcel not found',
        reason instanceof Error ? reason.message : 'Check the code and try again.',
      );
    }
  }
  async function record(input: JourneyEventInput) {
    if (!session || !selectedId) return;
    const parcel = parcels.find((item) => item.id === selectedId);
    if (!parcel) return;
    try {
      const updated = await api.recordEvent(parcel.id, input, session.token);
      const next = parcels.map((item) => (item.id === updated.id ? updated : item));
      setParcels(next);
      await storage.saveParcels(next);
      Alert.alert('Evidence recorded', 'The operations desk can now see this handoff.');
    } catch {
      await enqueue({ parcelId: parcel.id, parcelCode: parcel.code, input });
      const optimistic: Parcel = {
        ...parcel,
        status: nextParcelStatus(parcel.status, input.type),
        version: parcel.version + 1,
        updatedAt: input.capturedAt,
        events: [
          ...parcel.events,
          {
            id: input.idempotencyKey,
            parcelId: parcel.id,
            type: input.type,
            coordinates: input.coordinates,
            capturedAt: input.capturedAt,
            recordedAt: input.capturedAt,
            ...(input.note ? { note: input.note } : {}),
            ...(input.recipientName ? { recipientName: input.recipientName } : {}),
          },
        ],
      };
      const next = parcels.map((item) => (item.id === parcel.id ? optimistic : item));
      setParcels(next);
      await storage.saveParcels(next);
      setPendingCount((await storage.queue()).length);
      Alert.alert(
        'Saved offline',
        'Tapak will send this evidence when the connection returns.',
      );
    }
  }

  if (!ready) return null;
  if (!session)
    return (
      <>
        <StatusBar style="light" />
        <LoginScreen onAuthenticated={(next) => void authenticated(next)} />
      </>
    );
  const selected = parcels.find((parcel) => parcel.id === selectedId);
  return (
    <>
      <StatusBar style={screen === 'scanner' ? 'light' : 'dark'} />
      {screen === 'scanner' ? (
        <ScannerScreen onClose={() => setScreen('route')} onCode={scan} />
      ) : screen === 'parcel' && selected ? (
        <ParcelScreen
          parcel={selected}
          onClose={() => setScreen('route')}
          onRecord={record}
        />
      ) : (
        <RouteScreen
          onOpen={open}
          onRefresh={() => void refresh()}
          onScan={() => setScreen('scanner')}
          onSignOut={() => void signOut()}
          parcels={parcels}
          pendingCount={pendingCount}
          refreshing={refreshing}
          session={session}
        />
      )}
    </>
  );
}
