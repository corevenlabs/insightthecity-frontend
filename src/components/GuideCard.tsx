import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Guide } from '../lib/guides';
import { NewsImage } from './NewsImage';

export function GuideCard({ guide, width, onPress, accessibilityLabel }: {
  guide: Guide;
  width?: number;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  return (
    <TouchableOpacity style={[s.card, width !== undefined && { width }]} onPress={onPress}
      activeOpacity={0.78} accessibilityRole="button" accessibilityLabel={accessibilityLabel}>
      <NewsImage uri={guide.coverUrl} style={s.cover} accessibilityLabel={guide.title} />
      <View style={s.body}>
        <Text style={s.title} numberOfLines={1}>{guide.title}</Text>
        {!!guide.description && <Text style={s.description} numberOfLines={1}>{guide.description}</Text>}
        <View style={s.badges}>
          {guide.includedInMembership && <View style={[s.badge, s.club]}><Text style={s.clubText}>ITC CLUB</Text></View>}
          {guide.individualPurchaseEnabled && guide.access !== 'free' && (
            <View style={s.badge}><Text style={s.price}>{new Intl.NumberFormat('en-US', {
              style: 'currency', currency: guide.currency || 'USD',
            }).format(guide.priceCents / 100)}</Text></View>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={22} color="#A6A6A6" style={s.arrow} accessible={false} />
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', padding: 4, borderRadius: 14,
    borderWidth: 1, borderColor: '#2C2C2C', backgroundColor: '#121212', overflow: 'hidden', minHeight: 112 },
  cover: { width: 132, alignSelf: 'stretch', minHeight: 102, borderRadius: 9, backgroundColor: '#1A1A1A' },
  body: { flex: 1, minWidth: 0, paddingLeft: 10, paddingVertical: 6 },
  title: { color: '#FFFFFF', fontSize: 16, lineHeight: 21, fontWeight: '700' },
  description: { color: '#A6A6A6', fontSize: 13, lineHeight: 18, marginTop: 4 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 7 },
  badge: { borderWidth: 1, borderColor: '#999999', borderRadius: 99, paddingHorizontal: 12,
    paddingVertical: 4, alignItems: 'center', justifyContent: 'center' },
  club: { borderColor: '#A98B30' },
  clubText: { color: '#D4AF37', fontSize: 12, lineHeight: 16, fontWeight: '700' },
  price: { color: '#FFFFFF', fontSize: 13, lineHeight: 16, fontWeight: '700' },
  arrow: { marginHorizontal: 7 },
});
