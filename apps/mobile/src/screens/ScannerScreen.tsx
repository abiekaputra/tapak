// Module responsible for opening parcels through camera scans or manual codes.
import { useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

import { Button } from '../components/Button';
import { colors, radius } from '../theme';

export function ScannerScreen({
  onCode,
  onClose,
}: {
  onCode: (code: string) => Promise<void>;
  onClose: () => void;
}) {
  const [permission, requestPermission] = useCameraPermissions();
  const [manual, setManual] = useState('');
  const [locked, setLocked] = useState(false);
  const cameraAvailable = Platform.OS !== 'web' && permission?.granted;

  async function accept(code: string) {
    if (locked || !code.trim()) return;
    setLocked(true);
    try {
      await onCode(code.trim());
    } finally {
      setLocked(false);
    }
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Button label="Close" onPress={onClose} variant="secondary" />
        <Text style={styles.heading}>Scan parcel</Text>
        <View style={styles.spacer} />
      </View>
      {cameraAvailable ? (
        <View style={styles.cameraFrame}>
          <CameraView
            barcodeScannerSettings={{ barcodeTypes: ['qr', 'code128'] }}
            onBarcodeScanned={locked ? undefined : ({ data }) => void accept(data)}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.reticle} />
        </View>
      ) : (
        <View style={styles.permission}>
          <Text style={styles.permissionTitle}>Camera scan</Text>
          <Text style={styles.permissionCopy}>
            {Platform.OS === 'web'
              ? 'Camera scanning is available in Expo Go. Use a code manually in this browser preview.'
              : 'Allow camera access to scan a Tapak parcel label.'}
          </Text>
          {Platform.OS !== 'web' && (
            <Button label="Allow camera" onPress={() => void requestPermission()} />
          )}
        </View>
      )}
      <View style={styles.manual}>
        <Text style={styles.label}>OR ENTER THE CODE</Text>
        <TextInput
          autoCapitalize="characters"
          onChangeText={setManual}
          placeholder="TPK-1234ABCD"
          style={styles.input}
          value={manual}
        />
        <Button
          busy={locked}
          disabled={!manual.trim()}
          label="Open journey"
          onPress={() => void accept(manual)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.ink,
    flex: 1,
    paddingBottom: 30,
    paddingHorizontal: 20,
    paddingTop: 52,
  },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  heading: { color: colors.white, fontSize: 18, fontWeight: '900' },
  spacer: { width: 75 },
  cameraFrame: {
    borderRadius: radius.large,
    flex: 1,
    marginVertical: 22,
    overflow: 'hidden',
  },
  reticle: {
    borderColor: colors.clay,
    borderRadius: 22,
    borderWidth: 3,
    height: 210,
    left: '15%',
    position: 'absolute',
    top: '30%',
    width: '70%',
  },
  permission: {
    alignItems: 'center',
    backgroundColor: '#1F3A45',
    borderRadius: radius.large,
    flex: 1,
    justifyContent: 'center',
    marginVertical: 22,
    padding: 28,
  },
  permissionTitle: { color: colors.white, fontSize: 25, fontWeight: '900' },
  permissionCopy: {
    color: '#C9D4D6',
    lineHeight: 22,
    marginBottom: 20,
    marginTop: 8,
    textAlign: 'center',
  },
  manual: {
    backgroundColor: colors.paper,
    borderRadius: radius.large,
    gap: 12,
    padding: 18,
  },
  label: { color: colors.clayDark, fontSize: 10, fontWeight: '900', letterSpacing: 1.6 },
  input: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: radius.small,
    borderWidth: 1,
    color: colors.ink,
    fontFamily: 'monospace',
    minHeight: 48,
    paddingHorizontal: 14,
  },
});
