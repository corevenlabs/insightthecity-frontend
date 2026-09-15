import { StyleSheet, Text, View } from 'react-native';

export function ExperienceTags({ tags }: { tags: string[] }) {
  return <View style={styles.tags}>{tags.map((tag) => <View key={tag} style={styles.tag}><Text style={styles.text}>{tag}</Text></View>)}</View>;
}

const styles = StyleSheet.create({
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, flexShrink: 1 },
  tag: { borderWidth: 1, borderColor: '#D4AF37', borderRadius: 12, paddingHorizontal: 9, paddingVertical: 4, maxWidth: '100%' },
  text: { color: '#D4AF37', fontSize: 11, fontWeight: '700' },
});
