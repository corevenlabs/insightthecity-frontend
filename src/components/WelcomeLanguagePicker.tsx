import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage, type AppLanguage } from '../context/LanguageContext';
import { LANGUAGE_NAMES } from '../i18n/ui';
import { Text } from './typography';

export function WelcomeLanguagePicker() {
  const { language, setLanguage, t, ui } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [pending, setPending] = useState<AppLanguage | null>(null);
  const [failed, setFailed] = useState(false);
  const saving = useRef(false);
  const close = () => { if (!saving.current) setVisible(false); };
  const select = async (next: AppLanguage) => {
    if (saving.current) return;
    if (next === language) { close(); return; }
    saving.current = true;
    setPending(next);
    setFailed(false);
    try {
      await setLanguage(next);
      setVisible(false);
    } catch {
      setFailed(true);
    } finally {
      saving.current = false;
      setPending(null);
    }
  };
  return <>
    <Pressable accessibilityRole="button" accessibilityLabel={`${t('register.language')}: ${LANGUAGE_NAMES[language]}`}
      accessibilityState={{ expanded: visible }} onPress={() => { setFailed(false); setVisible(true); }}
      style={({ pressed }) => [styles.trigger, pressed && styles.pressed]}>
      <Ionicons name="globe-outline" size={18} color="#FDDD56" accessible={false} />
      <Text style={styles.current} numberOfLines={1}>{LANGUAGE_NAMES[language]}</Text>
      <Ionicons name="chevron-down" size={14} color="#FFF" accessible={false} />
    </Pressable>
    <Modal visible={visible} transparent animationType="fade" presentationStyle="overFullScreen" onRequestClose={close}>
      <SafeAreaProvider>
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} accessibilityRole="button" accessibilityLabel={ui('Cerrar')}
            disabled={pending !== null} onPress={close} />
          <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.sheet} accessibilityViewIsModal onAccessibilityEscape={close}>
            <View style={styles.header}>
              <Text style={styles.title} accessibilityRole="header">{ui('Elige tu idioma')}</Text>
              <Pressable accessibilityRole="button" accessibilityLabel={ui('Cerrar')} disabled={pending !== null}
                onPress={close} style={({ pressed }) => [styles.close, pressed && styles.pressed]}>
                <Ionicons name="close" size={24} color="#FFF" accessible={false} />
              </Pressable>
            </View>
            <ScrollView style={styles.options} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
              {(Object.keys(LANGUAGE_NAMES) as AppLanguage[]).map(item => <Pressable key={item}
                accessibilityRole="radio" accessibilityLabel={LANGUAGE_NAMES[item]}
                accessibilityState={{ checked: item === language, disabled: pending !== null, busy: pending === item }}
                disabled={pending !== null} onPress={() => void select(item)}
                style={({ pressed }) => [styles.option, pressed && styles.pressed]}>
                <Text style={styles.optionText}>{LANGUAGE_NAMES[item]}</Text>
                {pending === item ? <ActivityIndicator color="#FDDD56" /> : item === language && <Ionicons name="checkmark" size={24} color="#FDDD56" accessible={false} />}
              </Pressable>)}
              {failed && <Text style={styles.error} accessibilityRole="alert">{ui('No se pudo cambiar el idioma. Revisa tu conexión e inténtalo de nuevo.')}</Text>}
            </ScrollView>
          </SafeAreaView>
        </View>
      </SafeAreaProvider>
    </Modal>
  </>;
}
const styles = StyleSheet.create({
  trigger: { minHeight: 44, maxWidth: 260, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 24, backgroundColor: 'rgba(5,5,5,0.75)' },
  current: { color: '#FFF', fontSize: 13, fontWeight: '600', flexShrink: 1 },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: { width: '100%', maxWidth: 560, maxHeight: '85%', alignSelf: 'center', backgroundColor: '#171717', borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingTop: 12, paddingBottom: 12 },
  header: { flexDirection: 'row', alignItems: 'center', paddingLeft: 24, paddingRight: 12, gap: 12 },
  title: { color: '#FFF', fontSize: 22, fontWeight: '700', flex: 1 },
  close: { minHeight: 48, minWidth: 48, alignItems: 'center', justifyContent: 'center' },
  options: { flexGrow: 0 }, content: { paddingHorizontal: 24, paddingBottom: 12 },
  option: { minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#333' },
  optionText: { color: '#FFF', fontSize: 18, flex: 1 },
  pressed: { opacity: 0.7 }, error: { color: '#FF8080', fontSize: 14, lineHeight: 21, marginTop: 16 },
});
