import { requireOptionalNativeModule } from 'expo';
import { useState } from 'react';
import { Platform, StyleSheet, TurboModuleRegistry, View } from 'react-native';
import AppleAccess from './AppleAccess';
import GoogleAccess from './GoogleAccess';
import { Text } from './typography';
import { useLanguage } from '../context/LanguageContext';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

export function AuthSocialButtons({ onSuccess }: { onSuccess: () => void }) {
  const { ui } = useLanguage();
  const { width, fontScale } = useResponsiveLayout();
  const [expanded, setExpanded] = useState<'apple' | 'google' | null>(null);
  const apple = Platform.OS === 'ios' && Boolean(requireOptionalNativeModule('ExpoAppleAuthentication'));
  const google = Platform.OS !== 'web' && Boolean(TurboModuleRegistry.get('RNGoogleSignin'));
  if (!apple && !google) return null;
  const horizontal = apple && google && !expanded && width >= 360 && fontScale <= 1.3;
  return <View style={styles.container}>
    <View style={styles.divider}>
      <View style={styles.line} /><Text style={styles.dividerText}>{ui('O continúa con')}</Text><View style={styles.line} />
    </View>
    <View style={[styles.buttons, horizontal && styles.horizontal]}>
      {google && (!expanded || expanded === 'google') && <View style={horizontal && styles.column}>
        <GoogleAccess compact={!expanded} onSuccess={onSuccess} onExpandedChange={active => setExpanded(active ? 'google' : null)} />
      </View>}
      {apple && (!expanded || expanded === 'apple') && <View style={horizontal && styles.column}>
        <AppleAccess compact={!expanded} onSuccess={onSuccess} onExpandedChange={active => setExpanded(active ? 'apple' : null)} />
      </View>}
    </View>
  </View>;
}
const styles = StyleSheet.create({
  container: { marginTop: 22 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  line: { flex: 1, height: 1, backgroundColor: '#333' }, dividerText: { color: '#BDBDBD', fontSize: 13 },
  buttons: { gap: 12 }, horizontal: { flexDirection: 'row' }, column: { flex: 1 },
});
