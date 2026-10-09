// Module responsible for authenticating couriers in the Tapak mobile product.
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { Session } from '@tapak/contracts';

import { api } from '../api';
import { Brand } from '../components/Brand';
import { Button } from '../components/Button';
import { colors, radius } from '../theme';

export function LoginScreen({
  onAuthenticated,
}: {
  onAuthenticated: (session: Session) => void;
}) {
  const [email, setEmail] = useState('courier@tapak.local');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setError('');
    try {
      const session = await api.login(email, password);
      if (session.actor.role !== 'COURIER')
        throw new Error('Use a courier account in the mobile app.');
      onAuthenticated(session);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Sign in failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.root}
    >
      <View style={styles.hero}>
        <Brand inverse />
        <Text style={styles.eyebrow}>COURIER JOURNEY</Text>
        <Text style={styles.title}>Carry the parcel. Keep the proof.</Text>
        <Text style={styles.copy}>
          Scan an assignment, record each handoff, and keep working when the signal
          disappears.
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.heading}>Start your route</Text>
        <Text style={styles.muted}>Use the local courier credentials.</Text>
        <TextInput
          accessibilityLabel="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="Email"
          style={styles.input}
          value={email}
        />
        <TextInput
          accessibilityLabel="Password"
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          style={styles.input}
          value={password}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button busy={busy} label="Open my route" onPress={() => void submit()} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: colors.sand, flex: 1, justifyContent: 'flex-end' },
  hero: {
    backgroundColor: colors.ink,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingTop: 42,
  },
  eyebrow: {
    color: '#F39A73',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 44,
  },
  title: {
    color: colors.white,
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -2.2,
    lineHeight: 42,
    marginTop: 12,
  },
  copy: { color: '#C9D4D6', fontSize: 15, lineHeight: 23, marginTop: 18 },
  card: {
    backgroundColor: colors.paper,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    gap: 12,
    marginTop: -24,
    padding: 28,
    paddingBottom: 36,
  },
  heading: { color: colors.ink, fontSize: 24, fontWeight: '900', letterSpacing: -1 },
  muted: { color: colors.muted, marginBottom: 4 },
  input: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: radius.small,
    borderWidth: 1,
    color: colors.ink,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  error: {
    backgroundColor: '#FFF0ED',
    borderRadius: radius.small,
    color: colors.error,
    padding: 10,
  },
});
