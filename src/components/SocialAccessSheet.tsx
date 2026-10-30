import type { ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router, useIsFocused } from 'expo-router';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';
import { MarketingConsent } from './MarketingConsent';
import { Text } from './typography';

/** Provider follow-up lives outside the compact Apple/Google button row. */
export function SocialAccessSheet({ visible, title, busy, onClose, children }: {
  visible: boolean; title: string; busy: boolean; onClose: () => void; children: ReactNode;
}) {
  const focused = useIsFocused();
  const { ui } = useLanguage();
  const close = () => { if (!busy) onClose(); };
  return <Modal transparent animationType="fade" visible={visible && focused} onRequestClose={close}>
    <SafeAreaProvider>
      <KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
          <View style={styles.sheet} accessibilityViewIsModal>
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
              <Text accessibilityRole="header" style={styles.title}>{title}</Text>
              {children}
              <Pressable accessibilityRole="button" disabled={busy} accessibilityState={{ disabled: busy }} onPress={close} style={styles.cancel}>
                <Text style={styles.cancelText}>{ui('Cancelar')}</Text>
              </Pressable>
            </ScrollView>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </SafeAreaProvider>
  </Modal>;
}

export function SocialLegalConsent({ accepted, onAccept, marketing, onMarketing, busy }: {
  accepted: boolean; onAccept: (value: boolean) => void; marketing: boolean; onMarketing: (value: boolean) => void; busy: boolean;
}) {
  const { ui } = useLanguage();
  return <View style={styles.consent}>
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: accepted, disabled: busy }} disabled={busy}
      onPress={() => onAccept(!accepted)} style={styles.legalRow}>
      <View style={[styles.check, accepted && styles.checked]}>
        {accepted && <Ionicons name="checkmark" size={16} color="#050505" accessible={false} />}
      </View>
      <Text style={styles.legalText}>{ui('Acepto los términos y la política de privacidad')}</Text>
    </Pressable>
    <View style={styles.links}>
      {(['terms', 'privacy'] as const).map(slug => <Pressable key={slug} accessibilityRole="link" disabled={busy}
        style={styles.legalLink} onPress={() => router.push({ pathname: '/legal', params: { slug } } as never)}>
        <Text style={styles.linkText}>{ui(slug === 'terms' ? 'Términos' : 'Privacidad')}</Text>
      </Pressable>)}
    </View>
    <MarketingConsent checked={marketing} onChange={value => { if (!busy) onMarketing(value); }} />
  </View>;
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)' },
  safe: { flex: 1, justifyContent: 'flex-end', padding: 16 },
  sheet: { width: '100%', maxWidth: 480, maxHeight: '90%', alignSelf: 'center', backgroundColor: '#111111', borderColor: '#333333', borderWidth: 1, borderRadius: 24, overflow: 'hidden' },
  content: { padding: 22, gap: 16 },
  title: { color: '#FFFFFF', fontSize: 22, lineHeight: 28, fontWeight: '800' },
  consent: { gap: 4 },
  legalRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 10, minHeight: 48 },
  check: { width: 22, height: 22, borderRadius: 5, borderColor: '#777777', borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  checked: { backgroundColor: '#FDDD56', borderColor: '#FDDD56' },
  legalText: { flex: 1, color: '#FFFFFF', fontSize: 14, lineHeight: 21 },
  links: { flexDirection: 'row', flexWrap: 'wrap', gap: 20, paddingLeft: 34 },
  legalLink: { minHeight: 48, justifyContent: 'center' },
  linkText: { color: '#FDDD56', fontSize: 13 },
  cancel: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  cancelText: { color: '#FFFFFF', fontSize: 14 },
});
