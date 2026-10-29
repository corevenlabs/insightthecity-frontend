import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Image, Pressable, StyleSheet, View } from 'react-native';
import { Text } from './typography';

export function SocialAccessButton({ provider, label, height = 56, busy = false, disabled = false, onPress, compact = false }: {
  provider: 'apple' | 'google'; label: string; compact?: boolean; height?: number; busy?: boolean; disabled?: boolean; onPress?: () => void;
}) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label}
    accessibilityState={{ disabled: disabled || busy, busy }} disabled={disabled || busy} onPress={onPress}
    style={({ pressed }) => [styles.button, compact && styles.compactButton, {
      minHeight: height,
      // Keep the white welcome buttons opaque, including native-unavailable previews.
      opacity: compact ? 1 : disabled || busy ? 0.5 : 1,
      backgroundColor: pressed && !disabled && !busy ? '#ECECEC' : '#FFFFFF',
    }]}>
    <View pointerEvents="none" style={compact ? styles.compactIconSlot : styles.iconSlot}>
      {busy ? <ActivityIndicator color="#333" /> : provider === 'apple' ? (
        <Ionicons name="logo-apple" size={24} color="#050505" accessible={false} />
      ) : <Image
        source={require('../../assets/images/google-g.png')}
        resizeMode="contain" accessible={false}
        style={styles.googleIcon} />}
    </View>
    <Text style={[styles.label, compact && styles.compactLabel]}>{compact ? (provider === 'apple' ? 'Apple' : 'Google') : label.toUpperCase()}</Text>
  </Pressable>;
}

const styles = StyleSheet.create({
  button: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 14, justifyContent: 'center', paddingVertical: 18, paddingHorizontal: 64 },
  compactButton: { backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 12 },
  compactIconSlot: { width: 28, height: 32, alignItems: 'center', justifyContent: 'center' },
  compactLabel: { color: '#050505', fontWeight: '900', flexShrink: 1 },
  iconSlot: { position: 'absolute', left: 8, top: 0, bottom: 0, width: 56, alignItems: 'center', justifyContent: 'center' },
  googleIcon: { width: 20, height: 20 },
  label: { color: '#050505', fontSize: 15, fontWeight: '900', textAlign: 'center' },
});
