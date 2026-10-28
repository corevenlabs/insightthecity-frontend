import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from './typography';
import { useLanguage } from '../context/LanguageContext';
export function MarketingConsent({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  const { ui } = useLanguage();
  return <Pressable accessibilityRole="checkbox" accessibilityState={{ checked }}
    onPress={() => onChange(!checked)} style={styles.row}>
    <View style={[styles.box, checked && styles.selected]}>
      {checked && <Ionicons name="checkmark" size={16} color="#0A0A0A" />}
    </View>
    <View style={styles.copy}>
      <Text style={styles.text}>{ui('Quiero recibir promociones, novedades e información de Insight The City por correo electrónico.')}</Text>
      <Text style={styles.hint}>{ui('Opcional. Puedes crear tu cuenta sin activar esta opción.')}</Text>
    </View>
  </Pressable>;
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 12, minHeight: 48 },
  box: { width: 22, height: 22, borderWidth: 1, borderColor: '#777', borderRadius: 5, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  selected: { backgroundColor: '#FDDD56', borderColor: '#FDDD56' },
  copy: { flex: 1, gap: 6 }, text: { color: '#FFF', fontSize: 13, lineHeight: 20 },
  hint: { color: '#BDBDBD', fontSize: 12, lineHeight: 18 },
});
