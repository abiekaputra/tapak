// Module responsible for capturing location-backed courier journey evidence.
import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Location from 'expo-location';

import type { JourneyEventInput, JourneyEventType, Parcel } from '@tapak/contracts';
import { availableJourneyEvents } from '@tapak/domain';

import { Button } from '../components/Button';
import { StatusPill } from '../components/StatusPill';
import { colors, radius } from '../theme';

const labels: Record<JourneyEventType, string> = {
  PICKUP: 'Confirm pickup',
  TRANSIT: 'Add transit checkpoint',
  DELIVERY: 'Confirm delivery',
};

export function ParcelScreen({
  parcel,
  onClose,
  onRecord,
}: {
  parcel: Parcel;
  onClose: () => void;
  onRecord: (input: JourneyEventInput) => Promise<void>;
}) {
  const choices = useMemo(() => availableJourneyEvents(parcel.status), [parcel.status]);
  const [selected, setSelected] = useState<JourneyEventType | undefined>(choices[0]);
  const [recipientName, setRecipientName] = useState(parcel.recipientName);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => setSelected(choices[0]), [choices]);

  async function record() {
    if (!selected) return;
    setBusy(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted)
        throw new Error('Location permission is required for handoff evidence.');
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      await onRecord({
        idempotencyKey: crypto.randomUUID(),
        type: selected,
        coordinates: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          ...(location.coords.accuracy
            ? { accuracyMeters: location.coords.accuracy }
            : {}),
        },
        capturedAt: new Date().toISOString(),
        ...(note.trim() ? { note: note.trim() } : {}),
        ...(selected === 'DELIVERY' ? { recipientName: recipientName.trim() } : {}),
      });
    } catch (reason) {
      Alert.alert(
        'Evidence was not recorded',
        reason instanceof Error ? reason.message : 'Please try again.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Button label="Back" onPress={onClose} variant="secondary" />
        <StatusPill status={parcel.status} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.code}>{parcel.code}</Text>
        <Text style={styles.title}>{parcel.recipientName}</Text>
        <Text style={styles.address}>{parcel.recipientAddress}</Text>
        <View style={styles.meta}>
          <Text>Courier</Text>
          <Text>{parcel.courierName}</Text>
        </View>
        <Text style={styles.sectionTitle}>Journey evidence</Text>
        <View style={styles.timeline}>
          <View style={styles.event}>
            <View style={styles.dot} />
            <View>
              <Text style={styles.eventTitle}>Parcel assigned</Text>
              <Text style={styles.eventTime}>{formatTime(parcel.createdAt)}</Text>
            </View>
          </View>
          {parcel.events.map((event) => (
            <View key={event.id} style={styles.event}>
              <View style={styles.dot} />
              <View>
                <Text style={styles.eventTitle}>{labels[event.type]}</Text>
                <Text style={styles.eventTime}>{formatTime(event.recordedAt)}</Text>
                {event.recipientName && (
                  <Text style={styles.eventProof}>Received by {event.recipientName}</Text>
                )}
              </View>
            </View>
          ))}
        </View>
        {choices.length > 0 ? (
          <View style={styles.actionCard}>
            <Text style={styles.sectionTitle}>Record the next handoff</Text>
            <View style={styles.choiceRow}>
              {choices.map((choice) => (
                <Button
                  key={choice}
                  label={labels[choice]}
                  onPress={() => setSelected(choice)}
                  variant={selected === choice ? 'primary' : 'secondary'}
                />
              ))}
            </View>
            {selected === 'DELIVERY' && (
              <TextInput
                accessibilityLabel="Recipient name"
                onChangeText={setRecipientName}
                placeholder="Recipient name"
                style={styles.input}
                value={recipientName}
              />
            )}
            <TextInput
              accessibilityLabel="Optional note"
              onChangeText={setNote}
              placeholder="Optional note"
              style={styles.input}
              value={note}
            />
            <Text style={styles.locationNote}>
              Tapak will attach the current coordinates and capture time.
            </Text>
            <Button
              busy={busy}
              disabled={selected === 'DELIVERY' && recipientName.trim().length < 2}
              label="Record handoff"
              onPress={() => void record()}
            />
          </View>
        ) : (
          <View style={styles.complete}>
            <Text style={styles.completeTitle}>Journey complete</Text>
            <Text style={styles.completeCopy}>
              The recipient and each recorded handoff remain visible in the immutable
              journey trail.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

const styles = StyleSheet.create({
  root: { backgroundColor: colors.sand, flex: 1 },
  header: {
    alignItems: 'center',
    backgroundColor: colors.paper,
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 14,
    paddingHorizontal: 20,
    paddingTop: 52,
  },
  content: { padding: 20, paddingBottom: 50 },
  code: {
    color: colors.clayDark,
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 10,
  },
  title: {
    color: colors.ink,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1.5,
    marginTop: 8,
  },
  address: { color: colors.muted, fontSize: 15, lineHeight: 22, marginTop: 5 },
  meta: {
    backgroundColor: colors.paper,
    borderColor: colors.line,
    borderRadius: radius.medium,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    padding: 15,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 14,
    marginTop: 25,
  },
  timeline: { backgroundColor: colors.paper, borderRadius: radius.medium, padding: 18 },
  event: { flexDirection: 'row', gap: 12, minHeight: 64 },
  dot: {
    backgroundColor: colors.clay,
    borderRadius: 10,
    height: 11,
    marginTop: 4,
    width: 11,
  },
  eventTitle: { color: colors.ink, fontWeight: '800' },
  eventTime: { color: colors.muted, fontSize: 12, marginTop: 3 },
  eventProof: { color: colors.green, fontSize: 12, fontWeight: '700', marginTop: 3 },
  actionCard: {
    backgroundColor: colors.paper,
    borderColor: colors.line,
    borderRadius: radius.large,
    borderWidth: 1,
    marginTop: 18,
    padding: 18,
  },
  choiceRow: { gap: 8 },
  input: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: radius.small,
    borderWidth: 1,
    color: colors.ink,
    marginTop: 10,
    minHeight: 48,
    paddingHorizontal: 13,
  },
  locationNote: { color: colors.muted, fontSize: 12, lineHeight: 18, marginVertical: 13 },
  complete: {
    backgroundColor: '#E2F3E9',
    borderRadius: radius.large,
    marginTop: 20,
    padding: 20,
  },
  completeTitle: { color: colors.green, fontSize: 20, fontWeight: '900' },
  completeCopy: { color: '#356D58', lineHeight: 20, marginTop: 5 },
});
