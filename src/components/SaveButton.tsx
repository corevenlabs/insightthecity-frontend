import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import { useSaved, type SavedItem } from '../context/SavedContext';
import { useLanguage } from '../context/LanguageContext';

export function SaveButton({ item, inline = false, bottom = false }: { item: SavedItem; inline?: boolean; bottom?: boolean }) {
  const { items, ready, toggle } = useSaved();
  const { ui } = useLanguage();
  const selected = items.some(entry => entry.key === item.key);
  if (item.canSave === false) return null;
  return <Pressable disabled={!ready} accessibilityRole="button" accessibilityLabel={`${ui(selected ? 'Quitar de guardados' : 'Guardar')} ${item.title}`}
    accessibilityState={{ selected, disabled: !ready }} onPress={event => { event.stopPropagation(); void toggle(item); }}
    style={({ pressed }) => [s.button, bottom && { top: undefined, bottom: 4 }, inline && { position: 'relative', right: 0, top: 0 }, { opacity: pressed || !ready ? 0.5 : 1 }]}>
    <Ionicons name={selected ? 'bookmark' : 'bookmark-outline'} size={23} color={selected ? '#D4AF37' : '#FFFFFF'} />
  </Pressable>;
}
const s = StyleSheet.create({ button: { position: 'absolute', right: 4, top: 4, width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', zIndex: 2 } });
