import { Ionicons } from '@expo/vector-icons';
import { useState, type PropsWithChildren } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, type StyleProp, type TextStyle } from 'react-native';

export function ExpandableSection({ title, children }: PropsWithChildren<{ title: string }>) {
  const [expanded, setExpanded] = useState(false);
  return (
    <View>
      <TouchableOpacity
        style={styles.heading}
        onPress={() => setExpanded((value) => !value)}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ expanded }}
      >
        <Text style={styles.title}>{title}</Text>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color="#D4AF37" accessible={false} />
      </TouchableOpacity>
      {expanded && children}
    </View>
  );
}

export function ExpandableText({ text, style, color = '#D4AF37' }: {
  text: string;
  style?: StyleProp<TextStyle>;
  color?: string;
}) {
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
        accessibilityLabel={expanded ? 'Ver menos descripción' : 'Ver descripción completa'}
        accessibilityState={{ expanded }}
      >
        <Text style={[styles.toggleLabel, { color }]}>{expanded ? 'Ver menos' : 'Ver más'}</Text>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={color} accessible={false} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48, marginHorizontal: 20, marginTop: 26, marginBottom: 10 },
  title: { flex: 1, color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  textToggle: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 48, alignSelf: 'flex-start' },
  toggleLabel: { fontSize: 13, fontWeight: '700' },
});
