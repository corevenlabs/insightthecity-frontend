import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Definimos la interfaz del evento para que TypeScript esté feliz
interface EventListItemProps {
  event: any; // Por ahora lo dejamos como any para no complicar, luego lo tipamos bien
}

export function EventListItem({ event }: EventListItemProps) {
  return (
    <TouchableOpacity style={styles.card}>
      <Image source={{ uri: event.image }} style={styles.image} />

      <View style={styles.cardContent}>
        <View style={styles.topRow}>
          <Text style={styles.category}>{event.category}</Text>
          <View style={[styles.badge, event.free ? styles.freeBadge : styles.premiumBadge]}>
            <Text style={styles.badgeText}>{event.free ? 'GRATIS' : 'PREMIUM'}</Text>
          </View>
        </View>

        <Text style={styles.eventTitle}>{event.title}</Text>
        <Text style={styles.location}>📍 {event.location}</Text>
        <Text style={styles.time}>{event.time}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#121212', borderRadius: 20, overflow: 'hidden', marginBottom: 18 },
  image: { width: '100%', height: 180 },
  cardContent: { padding: 16 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between' },
  category: { color: '#D4AF37', fontWeight: '700' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  freeBadge: { backgroundColor: '#D4AF37' },
  premiumBadge: { backgroundColor: '#303030' },
  badgeText: { color: '#000', fontSize: 11, fontWeight: '700' },
  eventTitle: { color: '#FFF', fontSize: 18, fontWeight: '700', marginTop: 10 },
  location: { color: '#AAA', marginTop: 8 },
  time: { color: '#AAA', marginTop: 4 },
});