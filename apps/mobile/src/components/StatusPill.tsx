// Module responsible for displaying mobile parcel statuses with accessible labels.
import { StyleSheet, Text, View } from 'react-native';

import type { ParcelStatus } from '@tapak/contracts';

import { colors, radius } from '../theme';

const labels: Record<ParcelStatus, string> = {
  CREATED: 'Created',
  ASSIGNED: 'Assigned',
  PICKED_UP: 'Picked up',
  IN_TRANSIT: 'In transit',
  DELIVERED: 'Delivered',
};

export function StatusPill({ status }: { status: ParcelStatus }) {
  const complete = status === 'DELIVERED';
  const active = status === 'PICKED_UP' || status === 'IN_TRANSIT';
  return (
    <View
      style={[
        styles.root,
        complete ? styles.complete : undefined,
        active ? styles.active : undefined,
      ]}
    >
      <Text
        style={[
          styles.text,
          complete ? styles.completeText : undefined,
          active ? styles.activeText : undefined,
        ]}
      >
        {labels[status]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFF0DF',
    borderRadius: radius.pill,
    justifyContent: 'center',
    minHeight: 30,
    paddingHorizontal: 11,
  },
  text: {
    color: '#943B13',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  active: { backgroundColor: '#E5F0F5' },
  activeText: { color: colors.blue },
  complete: { backgroundColor: '#E2F3E9' },
  completeText: { color: colors.green },
});
