import { ScrollView, StyleSheet, View } from 'react-native';
import { useLanguage } from '../context/LanguageContext';

export function HomeCardsSkeleton({ width, compact = false, single = false, height }: { width: number; compact?: boolean; single?: boolean; height?: number }) {
  const { ui } = useLanguage();
  const cards = <View style={styles.row} importantForAccessibility="no-hide-descendants">
    {Array.from({ length: single ? 1 : 2 }, (_, i) => <View key={i} style={[styles.card, { width, height: height ?? (compact ? 132 : Math.max(230, width / 1.36)) }, compact && styles.compact]}>
      {compact && <View style={[styles.photo, height === 88 && { width: 88 }]} />}
      <View style={compact ? styles.compactLines : styles.lines}>
        <View style={[styles.line, styles.title]} />
        <View style={styles.line} />
        <View style={[styles.line, styles.short]} />
      </View>
    </View>)}
  </View>;
  return <View pointerEvents="none" accessibilityRole="progressbar" accessibilityLabel={ui('Cargando…')} accessibilityState={{ busy: true }}>
    {single ? cards : <ScrollView horizontal scrollEnabled={false} showsHorizontalScrollIndicator={false}>{cards}</ScrollView>}
  </View>;
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  card: { borderRadius: 16, backgroundColor: '#1A1A1A', overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: '#292929' },
  compact: { flexDirection: 'row', backgroundColor: '#121212' },
  photo: { width: '48%', height: '100%', backgroundColor: '#1A1A1A' },
  lines: { position: 'absolute', bottom: 32, left: 14, right: 14, gap: 9 },
  compactLines: { flex: 1, justifyContent: 'center', padding: 12, gap: 9 },
  line: { height: 9, width: '92%', borderRadius: 5, backgroundColor: '#303030' },
  title: { height: 15, width: '70%' }, short: { width: '55%' },
});
