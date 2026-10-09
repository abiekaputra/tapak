// Module responsible for presenting the courier's assigned parcel route.
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import type { Parcel, Session } from '@tapak/contracts';

import { Brand } from '../components/Brand';
import { Button } from '../components/Button';
import { StatusPill } from '../components/StatusPill';
import { colors, radius } from '../theme';

export function RouteScreen({
  session,
  parcels,
  pendingCount,
  refreshing,
  onRefresh,
  onOpen,
  onScan,
  onSignOut,
}: {
  session: Session;
  parcels: Parcel[];
  pendingCount: number;
  refreshing: boolean;
  onRefresh: () => void;
  onOpen: (parcel: Parcel) => void;
  onScan: () => void;
  onSignOut: () => void;
}) {
  const active = parcels.filter((parcel) => parcel.status !== 'DELIVERED');
  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Brand />
        <TouchableOpacity onPress={onSignOut}>
          <Text style={styles.signOut}>Sign out</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.clay}
          />
        }
      >
        <Text style={styles.eyebrow}>TODAY'S ROUTE</Text>
        <Text style={styles.title}>Hi, {session.actor.name.split(' ')[0]}.</Text>
        <Text style={styles.lead}>
          {active.length} active {active.length === 1 ? 'journey' : 'journeys'} assigned
          to you.
        </Text>
        <TouchableOpacity accessibilityRole="button" onPress={onScan} style={styles.scan}>
          <View>
            <Text style={styles.scanLabel}>SCAN PARCEL</Text>
            <Text style={styles.scanTitle}>Open a journey by code</Text>
          </View>
          <Text style={styles.scanIcon}>⌗</Text>
        </TouchableOpacity>
        {pendingCount > 0 && (
          <View style={styles.pending}>
            <Text style={styles.pendingTitle}>
              {pendingCount} update{pendingCount > 1 ? 's' : ''} waiting to sync
            </Text>
            <Text style={styles.pendingCopy}>
              Tapak will retry when this device reconnects.
            </Text>
            <View style={styles.pendingAction}>
              <Button label="Sync now" onPress={onRefresh} variant="secondary" />
            </View>
          </View>
        )}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Assigned parcels</Text>
          <Text style={styles.count}>{parcels.length}</Text>
        </View>
        {parcels.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No parcels assigned</Text>
            <Text style={styles.emptyCopy}>
              Pull to refresh when the operator assigns a new journey.
            </Text>
          </View>
        ) : (
          parcels.map((parcel) => (
            <TouchableOpacity
              accessibilityRole="button"
              key={parcel.id}
              onPress={() => onOpen(parcel)}
              style={styles.card}
            >
              <View style={styles.cardTop}>
                <Text style={styles.code}>{parcel.code}</Text>
                <StatusPill status={parcel.status} />
              </View>
              <Text style={styles.recipient}>{parcel.recipientName}</Text>
              <Text numberOfLines={2} style={styles.address}>
                {parcel.recipientAddress}
              </Text>
              <View style={styles.cardBottom}>
                <Text style={styles.evidence}>
                  {parcel.events.length} evidence points
                </Text>
                <Text style={styles.arrow}>→</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
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
  signOut: { color: colors.ink, fontSize: 12, fontWeight: '800' },
  content: { padding: 20, paddingBottom: 50 },
  eyebrow: {
    color: colors.clayDark,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.8,
    marginTop: 14,
  },
  title: {
    color: colors.ink,
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -1.8,
    marginTop: 8,
  },
  lead: { color: colors.muted, fontSize: 15, marginBottom: 22, marginTop: 5 },
  scan: {
    alignItems: 'center',
    backgroundColor: colors.ink,
    borderRadius: radius.large,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  scanLabel: { color: '#F39A73', fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  scanTitle: { color: colors.white, fontSize: 18, fontWeight: '800', marginTop: 5 },
  scanIcon: { color: colors.white, fontSize: 34 },
  pending: {
    backgroundColor: '#FFF0DF',
    borderRadius: radius.medium,
    marginTop: 14,
    padding: 15,
  },
  pendingTitle: { color: '#7A3215', fontWeight: '800' },
  pendingCopy: { color: '#87543E', fontSize: 12, marginTop: 3 },
  pendingAction: { marginTop: 12 },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    marginTop: 28,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  count: {
    backgroundColor: '#E6DED3',
    borderRadius: radius.pill,
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  card: {
    backgroundColor: colors.paper,
    borderColor: colors.line,
    borderRadius: radius.medium,
    borderWidth: 1,
    marginBottom: 12,
    padding: 17,
  },
  cardTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  code: {
    color: colors.clayDark,
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '900',
  },
  recipient: { color: colors.ink, fontSize: 19, fontWeight: '900', marginTop: 17 },
  address: { color: colors.muted, lineHeight: 20, marginTop: 5 },
  cardBottom: {
    alignItems: 'center',
    borderTopColor: colors.line,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingTop: 12,
  },
  evidence: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  arrow: { color: colors.clay, fontSize: 22, fontWeight: '900' },
  empty: {
    alignItems: 'center',
    backgroundColor: colors.paper,
    borderColor: colors.line,
    borderRadius: radius.medium,
    borderStyle: 'dashed',
    borderWidth: 1,
    padding: 32,
  },
  emptyTitle: { color: colors.ink, fontSize: 18, fontWeight: '800' },
  emptyCopy: { color: colors.muted, lineHeight: 20, marginTop: 5, textAlign: 'center' },
});
