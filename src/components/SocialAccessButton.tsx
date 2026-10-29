import { ActivityIndicator, Image, Pressable, StyleSheet, View } from 'react-native';
import { Text } from './typography';

export function SocialAccessButton({ provider, label, height = 56, busy = false, disabled = false, compact = false, onPress }: {
  provider: 'apple' | 'google'; compact?: boolean; label: string; height?: number; busy?: boolean; disabled?: boolean; onPress?: () => void;
}) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label}
    accessibilityState={{ disabled: disabled || busy, busy }} disabled={disabled || busy} onPress={onPress}
    style={[styles.button, compact && styles.compactButton, { minHeight: height, opacity: disabled || busy ? 0.5 : 1 }]}>
    <View pointerEvents="none" style={[styles.iconSlot, compact && styles.compactIcon]}>
      {busy ? <ActivityIndicator color={compact ? '#FFFFFF' : '#333'} /> : <Image
        source={provider === 'apple' ? require('../../assets/images/apple-signin-logo.png') : require('../../assets/images/google-g.png')}
        resizeMode="contain" accessible={false}
        style={[compact && provider === 'apple' && { tintColor: '#FFFFFF' }, provider === 'apple' ? styles.appleIcon : styles.googleIcon]} />}
    </View>
    <Text style={[styles.label, compact && styles.compactLabel]}>{compact ? label : label.toUpperCase()}</Text>
  </Pressable>;
}

const styles = StyleSheet.create({
  button: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 14, justifyContent: 'center', paddingVertical: 18, paddingHorizontal: 64 },
  compactButton: { backgroundColor: '#090909', borderWidth: 1, borderColor: '#999999', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingVertical: 12 },
  compactIcon: { position: 'relative', left: 0, width: 24, height: 24 },
  compactLabel: { color: '#FFFFFF', fontSize: 12, lineHeight: 17, fontWeight: '700', flexShrink: 1 },
  iconSlot: { position: 'absolute', left: 8, top: 0, bottom: 0, width: 56, alignItems: 'center', justifyContent: 'center' },
  // Apple's official bitmap includes clear space; this yields a ~20px visible glyph.
  appleIcon: { width: 46, height: 46, transform: [{ translateY: 2 }] },
  googleIcon: { width: 20, height: 20 },
  label: { color: '#050505', fontSize: 15, fontWeight: '900', textAlign: 'center' },
});
