import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Definimos el tipo aquí mismo
type EventCardProps = {
  title: string;
  category: string;
};

export function EventCard({ title, category }: EventCardProps) {
  return (
    <TouchableOpacity style={styles.eventCard}>
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a' }}
        style={styles.eventImage}
      />
      <Text style={styles.category}>{category}</Text>
      <Text style={styles.eventTitle}>{title}</Text>
      <Text style={styles.eventTime}>Hoy · 7:00 PM</Text>
      <View style={styles.freeBadge}>
        <Text style={styles.freeText}>GRATIS</Text>
      </View>
    </TouchableOpacity>
  );
}

// Estos son los estilos que tenías en index.tsx. 
// Para que no se rompa el diseño, mantén los nombres idénticos.
const styles = StyleSheet.create({
  eventCard: { width: 180, backgroundColor: '#121212', borderRadius: 18, padding: 12, marginRight: 14 },
  eventImage: { width: '100%', height: 100, borderRadius: 12, marginBottom: 10 },
  category: { color: '#D4A017', fontSize: 11, fontWeight: '700' },
  eventTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '600', marginTop: 6 },
  eventTime: { color: '#A6A6A6', marginTop: 4 },
  freeBadge: { backgroundColor: '#D4A017', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginTop: 10 },
  freeText: { color: '#000', fontSize: 10, fontWeight: '700' },
});