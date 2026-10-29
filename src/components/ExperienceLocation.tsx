import { Ionicons } from '@expo/vector-icons';
import { Alert, Linking, Pressable, StyleSheet, View } from 'react-native';
import { Text } from './typography';
import { useLanguage } from '../context/LanguageContext';
import { eventMapsUrl, type EventLocation } from '../lib/experienceLocation';

/** The address handles its own tap instead of opening the surrounding event card. */
export function ExperienceLocation({ experience, full = false, color = '#CCC' }: { experience: EventLocation; full?: boolean; color?: string }) {
  const { ui } = useLanguage();
  const branches = experience.locations?.filter(item => item.benefitApplies !== false) ?? [];
  const address = full ? experience.location?.trim() || experience.shortAddress?.trim() || branches[0]?.address : experience.shortAddress?.trim();
  const url = eventMapsUrl(experience);
  const displayAddress = address || (full && url ? ui('Abrir en Google Maps') : '');
  const label = `${experience.region ?? 'NY'}${displayAddress ? ` · ${displayAddress}` : ''}${branches.length > 1 ? ` · ${ui('{count} ubicaciones', { count: branches.length })}` : ''}`;
  const content = <><Ionicons name="location-outline" size={16} color={color} /><Text style={[styles.label, { color }]} numberOfLines={full ? undefined : 1}>{label}</Text>{url && <Ionicons name="open-outline" size={14} color={color} />}</>;
  if (!url) return <View style={styles.row}>{content}</View>;
  return <Pressable style={styles.row} accessibilityRole="link" accessibilityLabel={`${label}. ${ui('Abrir en Google Maps')}`} hitSlop={4}
    onPress={(event) => {
      event.stopPropagation();
      void Linking.openURL(url).catch(() => Alert.alert(ui('No se pudo abrir Google Maps'), ui('Inténtalo nuevamente.')));
    }}>{content}</Pressable>;
}
const styles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center', gap: 5, minHeight: 32, flexShrink: 1, maxWidth: '100%' }, label: { fontSize: 13, lineHeight: 19, flexShrink: 1 } });
