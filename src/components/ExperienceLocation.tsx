import { Ionicons } from '@expo/vector-icons';
import { Alert, Linking, Pressable, StyleSheet, View } from 'react-native';
import { Text } from './typography';
import { useLanguage } from '../context/LanguageContext';
import { eventMapsUrl, type EventLocation } from '../lib/experienceLocation';

/** The address handles its own tap instead of opening the surrounding event card. */
export function ExperienceLocation({ experience, full = false, color = '#CCC' }: { experience: EventLocation; full?: boolean; color?: string }) {
  const { ui } = useLanguage();
  const address = full ? experience.location?.trim() || experience.shortAddress?.trim() : experience.shortAddress?.trim();
  const label = `${experience.region ?? 'NY'}${address ? ` · ${address}` : ''}`;
  const url = address ? eventMapsUrl(experience) : null;
  const content = <><Ionicons name="location-outline" size={16} color={color} /><Text style={[styles.label, { color }]} numberOfLines={full ? undefined : 1}>{label}</Text>{url && <Ionicons name="open-outline" size={14} color={color} />}</>;
  if (!url) return <View style={styles.row}>{content}</View>;
  return <Pressable style={styles.row} accessibilityRole="link" accessibilityLabel={`${label}. ${ui('Abrir en Google Maps')}`} hitSlop={4}
    onPress={(event) => {
      event.stopPropagation();
      void Linking.openURL(url).catch(() => Alert.alert(ui('No se pudo abrir Google Maps'), ui('Inténtalo nuevamente.')));
    }}>{content}</Pressable>;
}
const styles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center', gap: 5, minHeight: 32, flexShrink: 1, maxWidth: '100%' }, label: { fontSize: 13, lineHeight: 19, flexShrink: 1 } });
