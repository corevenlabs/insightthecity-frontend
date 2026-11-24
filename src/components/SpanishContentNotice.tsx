import { StyleSheet, View } from 'react-native';

import { useLanguage } from '../context/LanguageContext';
import { Text } from './typography';

// Shown when the news can only be read in their original Spanish.
export function SpanishContentNotice({ visible }: { visible: boolean }) {
  const { ui } = useLanguage();
  if (!visible) return null;
  return (
    <View style={styles.box}>
      <Text style={styles.text}>{ui('Por ahora este contenido solo está disponible en español.')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: '#151515', borderLeftWidth: 3, borderLeftColor: '#FDDD56', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 16 },
  text: { color: '#C7C7C7', fontSize: 14, lineHeight: 20 },
});
