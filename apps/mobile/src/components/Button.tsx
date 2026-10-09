// Module responsible for rendering consistent accessible Tapak actions.
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius } from '../theme';

export function Button({
  label,
  onPress,
  variant = 'primary',
  busy = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  busy?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || busy}
      onPress={onPress}
      style={({ pressed }) => [
        styles.root,
        styles[variant],
        pressed ? styles.pressed : undefined,
        disabled || busy ? styles.disabled : undefined,
      ]}
    >
      {busy ? (
        <ActivityIndicator color={variant === 'primary' ? colors.white : colors.ink} />
      ) : (
        <Text
          style={[
            styles.text,
            variant === 'primary' ? styles.primaryText : undefined,
            variant === 'danger' ? styles.dangerText : undefined,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    borderRadius: radius.pill,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 18,
  },
  primary: { backgroundColor: colors.clay },
  secondary: { backgroundColor: colors.paper, borderColor: colors.line, borderWidth: 1 },
  danger: { backgroundColor: '#FFF0ED', borderColor: '#F5B9AD', borderWidth: 1 },
  text: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  primaryText: { color: colors.white },
  dangerText: { color: colors.error },
  pressed: { opacity: 0.78 },
  disabled: { opacity: 0.55 },
});
