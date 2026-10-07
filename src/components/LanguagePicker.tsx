import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage, type AppLanguage } from '../context/LanguageContext';
import { LANGUAGE_NAMES } from '../i18n/ui';

export function LanguagePicker() {
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
    <Pressable accessibilityRole="button" accessibilityLabel={`${t('register.language')}: ${LANGUAGE_NAMES[language]}`} onPress={() => { setFailed(false); setVisible(true); }} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <Ionicons name="globe-outline" size={21} color="#FDDD56" accessible={false} />
      <Text style={styles.label}>{t('register.language')}</Text>
      <Text style={styles.value}>{LANGUAGE_NAMES[language]}</Text>
      <Ionicons name="chevron-forward" size={18} color="#FDDD56" accessible={false} />
    </Pressable>
    <Modal visible={visible} animationType="none" onRequestClose={close}>
      <SafeAreaProvider><SafeAreaView style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.title} accessibilityRole="header">{ui('Selecciona tu idioma')}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel={ui('Cerrar')} disabled={pending !== null} onPress={close} style={({ pressed }) => [styles.close, pressed && styles.pressed]}>
            <Ionicons name="close" size={25} color="#FDDD56" accessible={false} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.hint}>{ui('El cambio se aplica a toda la interfaz.')}</Text>
          {(Object.keys(LANGUAGE_NAMES) as AppLanguage[]).map((item) => <Pressable key={item} accessibilityRole="radio" aria-checked={item === language} aria-busy={pending === item} aria-disabled={pending !== null} accessibilityLabel={LANGUAGE_NAMES[item]} accessibilityState={{ checked: item === language, disabled: pending !== null, busy: pending === item }} disabled={pending !== null} onPress={() => void select(item)} style={({ pressed }) => [styles.option, item === language && styles.selected, pressed && styles.pressed]}>
            <Text style={[styles.optionText, item === language && styles.selectedText]}>{LANGUAGE_NAMES[item]}</Text>
            {pending === item ? <ActivityIndicator color="#FDDD56" /> : item === language ? <Ionicons name="checkmark-circle" size={24} color="#FDDD56" accessible={false} /> : <View style={styles.circle} />}
          </Pressable>)}
          {pending && <Text style={styles.hint} accessibilityLiveRegion="polite">{ui('Guardando…')}</Text>}
          {failed && <Text style={styles.error} accessibilityRole="alert">{ui('No se pudo cambiar el idioma. Revisa tu conexión e inténtalo de nuevo.')}</Text>}
        </ScrollView>
      </SafeAreaView></SafeAreaProvider>
    </Modal>
  </>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0A0A0A' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 56, paddingVertical: 12, width: '100%' },
  label: { color: '#A6A6A6', fontSize: 14, flex: 1 }, value: { color: '#FFF', fontSize: 14, flexShrink: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingLeft: 20, paddingRight: 12, paddingTop: 12 },
  title: { color: '#FFF', fontSize: 26, fontWeight: '700', flex: 1 },
  close: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, paddingBottom: 48 }, hint: { color: '#A6A6A6', fontSize: 16, lineHeight: 24, marginBottom: 24 },
  option: { minHeight: 64, borderRadius: 16, borderWidth: 1, borderColor: '#333', backgroundColor: '#121212', padding: 18, marginBottom: 12, flexDirection: 'row', gap: 16, alignItems: 'center' },
  selected: { borderColor: '#FDDD56', backgroundColor: 'rgba(253,221,86,0.08)' },
  optionText: { color: '#FFF', fontSize: 18, flex: 1 }, selectedText: { color: '#FDDD56', fontWeight: '700' },
  circle: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: '#777' },
  pressed: { opacity: 0.7 }, error: { color: '#FF8080', fontSize: 15, lineHeight: 22, marginTop: 12 },
});
