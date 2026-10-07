import { useLanguage } from '@/context/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import type { Experience } from '@/constants/experiences';
import { availableExperienceTags } from '@/lib/experienceFilters';
import { filterIcon } from '@/lib/filterIcons';

export function TagFilter({ items = [], options, selected, onChange }: {
  items?: Experience[];
  options?: string[];
  countResults?: (tags: string[]) => number;
  selected: string[];
  onChange: (tags: string[]) => void;
}) {
  const { ui, tagLabel } = useLanguage();
  const tags = Array.from(new Set([...(options ?? availableExperienceTags(items)), ...selected]));
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} nestedScrollEnabled
      style={styles.container} contentContainerStyle={styles.row}>
      <TouchableOpacity style={[styles.tag, selected.length === 0 && styles.selected]}
        activeOpacity={0.75} onPress={() => onChange([])} accessibilityRole="button"
        accessibilityLabel={ui('Todos')} accessibilityState={{ selected: selected.length === 0 }}>
        <Ionicons name="apps-outline" size={18} color={selected.length === 0 ? '#050505' : '#FDDD56'} accessible={false} />
        <Text style={[styles.tagText, selected.length === 0 && styles.selectedText]} numberOfLines={1}>{ui('Todos')}</Text>
      </TouchableOpacity>
      {tags.map(tag => {
        const checked = selected.includes(tag);
        return <TouchableOpacity key={tag} style={[styles.tag, checked && styles.selected]}
          activeOpacity={0.75} onPress={() => onChange(checked ? selected.filter(value => value !== tag) : [...selected, tag])}
          accessibilityRole="checkbox" accessibilityLabel={tagLabel(tag)} accessibilityState={{ checked }}>
          <Ionicons name={filterIcon(tag)} size={18} color={checked ? '#050505' : '#FDDD56'} accessible={false} />
          <Text style={[styles.tagText, checked && styles.selectedText]} numberOfLines={1}>{tagLabel(tag)}</Text>
          {checked && <Ionicons name="checkmark" size={16} color="#050505" accessible={false} />}
        </TouchableOpacity>;
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 0, marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingRight: 16, paddingVertical: 4 },
  tag: { flexShrink: 0, minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, backgroundColor: '#121212', borderWidth: 1, borderColor: '#333333' },
  selected: { backgroundColor: '#FDDD56', borderColor: '#FDDD56' },
  tagText: { color: '#FFFFFF', fontSize: 14, lineHeight: 20 },
  selectedText: { color: '#050505', fontWeight: '700' },
});
