// Module responsible for rendering the Tapak mobile identity.
import { Image, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';

export function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <View style={styles.root}>
      <Image source={require('../../assets/icon.png')} style={styles.mark} />
      <View>
        <Text style={[styles.name, inverse ? styles.inverse : undefined]}>Tapak</Text>
        <Text style={[styles.tagline, inverse ? styles.inverseMuted : undefined]}>
          Every handoff leaves a trace.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  mark: { height: 46, width: 46 },
  name: { color: colors.ink, fontSize: 23, fontWeight: '800', letterSpacing: -1 },
  tagline: { color: colors.muted, fontSize: 11 },
  inverse: { color: colors.white },
  inverseMuted: { color: '#C9D4D6' },
});
