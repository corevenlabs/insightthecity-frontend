import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Experience } from '@/constants/experiences';
import { availableExperienceTags, matchesExperienceTags } from '@/lib/experienceFilters';

export function TagFilter({ items = [], options, countResults, selected, onChange }: {
  items?: Experience[];
  options?: string[];
  countResults?: (tags: string[]) => number;
  selected: string[];
  onChange: (tags: string[]) => void;
}) {
  const [visible, setVisible] = useState(false);
  const [draft, setDraft] = useState<string[]>([]);
  const count = countResults ? countResults(draft) : items.filter((item) => matchesExperienceTags(item, draft)).length;
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.trigger} onPress={() => { setDraft([...selected]); setVisible(true); }} accessibilityRole="button" accessibilityLabel="Filtrar por etiquetas" accessibilityState={{ expanded: visible }}>
        <Ionicons name="options-outline" size={20} color="#D4AF37" accessible={false} />
        <Text style={styles.triggerText}>Filtrar{selected.length ? ` (${selected.length})` : ''}</Text>
      </TouchableOpacity>
      {selected.length > 0 && <TouchableOpacity style={styles.clear} onPress={() => onChange([])} accessibilityRole="button"><Text style={styles.secondary}>Limpiar</Text></TouchableOpacity>}
      <Modal visible={visible} animationType="none" transparent onRequestClose={() => setVisible(false)}>
        <View style={styles.backdrop}>
          <SafeAreaView style={styles.sheet} edges={['top', 'bottom']}>
            <View style={styles.header}>
              <Text style={styles.title}>Filtrar por etiquetas</Text>
              <TouchableOpacity style={styles.close} onPress={() => setVisible(false)} accessibilityRole="button" accessibilityLabel="Cerrar filtros"><Ionicons name="close" size={24} color="#D4AF37" /></TouchableOpacity>
            </View>
            <Text style={styles.hint}>Elige una o varias. Verás contenidos con cualquiera de las etiquetas seleccionadas.</Text>
            <ScrollView contentContainerStyle={styles.tags}>
              {(options ?? availableExperienceTags(items)).map((tag) => {
                const checked = draft.includes(tag);
                return <TouchableOpacity key={tag} style={[styles.tag, checked && styles.selected]} onPress={() => setDraft((current) => checked ? current.filter((value) => value !== tag) : [...current, tag])} accessibilityRole="checkbox" accessibilityState={{ checked }}>
                  <Text style={[styles.tagText, checked && styles.selectedText]}>{tag}</Text>
                  {checked && <Ionicons name="checkmark" size={16} color="#050505" accessible={false} />}
                </TouchableOpacity>;
              })}
            </ScrollView>
            <View style={styles.footer}>
              <TouchableOpacity style={styles.clear} onPress={() => setDraft([])} accessibilityRole="button"><Text style={styles.triggerText}>Limpiar</Text></TouchableOpacity>
              <TouchableOpacity style={styles.apply} onPress={() => { onChange(draft); setVisible(false); }} accessibilityRole="button"><Text style={styles.applyText}>Ver resultados ({count})</Text></TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  trigger: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#121212', borderWidth: 1, borderColor: '#D4AF37' },
  triggerText: { color: '#D4AF37', fontWeight: '700', fontSize: 15 },
  secondary: { color: '#A6A6A6', fontSize: 14 },
  clear: { minHeight: 48, paddingHorizontal: 12, justifyContent: 'center' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet: { maxHeight: '90%', backgroundColor: '#121212', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { flex: 1, color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  close: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  hint: { color: '#A6A6A6', fontSize: 15, lineHeight: 22, marginBottom: 18 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingBottom: 20 },
  tag: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 24, borderWidth: 1, borderColor: '#444', maxWidth: '100%' },
  selected: { backgroundColor: '#D4AF37', borderColor: '#D4AF37' },
  tagText: { color: '#FFFFFF', fontSize: 15, flexShrink: 1 },
  selectedText: { color: '#050505', fontWeight: '700' },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#333' },
  apply: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 14, backgroundColor: '#D4AF37' },
  applyText: { color: '#050505', fontWeight: '800', fontSize: 15 },
});
