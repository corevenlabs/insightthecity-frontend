import { Text } from './typography';
import { useLanguage } from '@/context/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import { useState, type PropsWithChildren, type ReactNode } from 'react';
import { StyleSheet, TouchableOpacity, View, type StyleProp, type TextStyle } from 'react-native';

export function ExpandableSection({ title, preview, children }: PropsWithChildren<{ title: string; preview: ReactNode }>) {
  const { ui } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  return (
    <View style={styles.card}>
      <Text style={styles.title} accessibilityRole="header">{title}</Text>
      {expanded ? children : preview}
      <TouchableOpacity
        style={styles.textToggle}
        onPress={() => setExpanded((value) => !value)}
        accessibilityRole="button"
        accessibilityLabel={`${expanded ? ui('Ver menos') : ui('Ver más')}: ${title}`}
        accessibilityState={{ expanded }}
      >
        <Text style={[styles.toggleLabel, { color: '#FDDD56' }]}>{expanded ? ui('Ver menos') : ui('Ver más')}</Text>
      </TouchableOpacity>
    </View>
  );
}

export function ExpandableText({ text, style, color = '#FDDD56', showChevron = true }: {
  text: string;
  style?: StyleProp<TextStyle>;
  color?: string;
  showChevron?: boolean;
}) {
  const { ui } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  return (
    <View>
      <Text style={style} numberOfLines={expanded ? undefined : 2}>{text}</Text>
      <TouchableOpacity
        style={styles.textToggle}
        onPress={(event) => {
          event.stopPropagation();
          setExpanded((value) => !value);
        }}
        accessibilityRole="button"
        accessibilityLabel={expanded ? ui("Ver menos descripción") : ui("Ver descripción completa")}
        accessibilityState={{ expanded }}
      >
        <Text style={[styles.toggleLabel, { color }]}>{expanded ? ui("Ver menos") : ui("Ver más")}</Text>
        {showChevron && <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={color} accessible={false} />}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 20, marginTop: 16, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4, borderWidth: StyleSheet.hairlineWidth, borderColor: '#333333', borderRadius: 16, backgroundColor: '#0C0C0C' },
  title: { color: '#FFFFFF', fontSize: 20, fontWeight: '800', marginBottom: 12 },
  textToggle: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 48, alignSelf: 'flex-start' },
  toggleLabel: { fontSize: 13, fontWeight: '700' },
});
