import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const items = [
  {
    id: 'ny-weekend-plans',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a',
    title: 'Bryant Park Movie Nights',
    subtitle: 'Cine al aire libre todos los lunes de verano en Manhattan.',
    date: 'Hoy',
  },
  {
    id: 'central-park-concert',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
    title: 'Conciertos gratis en Central Park',
    subtitle: 'Música, food trucks y ambiente local para cerrar el día.',
    date: 'Esta semana',
  },
  {
    id: 'ellens-stardust-diner',
    image: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260',
    title: 'Comedy Cellar y planes de noche',
    subtitle: 'Una ruta sencilla para disfrutar Greenwich Village.',
    date: 'Fin de semana',
  },
  {
    id: 'broadway-week',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba',
    title: 'Broadway Week',
    subtitle: 'Obras recomendadas, horarios y entradas con descuento.',
    date: 'Próximamente',
  },
];

export default function QueHacerScreen() {
  const router = useRouter();

  const openExperience = (id: string) => {
    router.push({
      pathname: '/experience-detail',
      params: { id },
    } as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={26} color="#D4AF37" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>¿Qué hacer en NY?</Text>
          <View style={{ width: 26 }} />
        </View>

        <Text style={styles.subtitle}>
          Planes, eventos y experiencias para moverte por Nueva York con intención.
        </Text>

        <TouchableOpacity
          style={styles.heroCard}
          onPress={() => openExperience('ny-weekend-plans')}
        >
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1514565131-fce0801e5785' }}
            style={styles.heroImage}
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.badge}>QUE HACER EN NY</Text>
            <Text style={styles.heroTitle}>Eventos destacados para vivir la ciudad</Text>
            <Text style={styles.heroText}>
              Una selección rápida de planes para hoy, el fin de semana y la temporada.
            </Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Últimos planes</Text>

        {items.map((item) => (
          <TouchableOpacity
            key={item.title}
            style={styles.articleCard}
            onPress={() => openExperience(item.id)}
          >
            <Image source={{ uri: item.image }} style={styles.articleImage} />
            <View style={styles.articleContent}>
              <Text style={styles.badge}>{item.date}</Text>
              <Text style={styles.articleTitle}>{item.title}</Text>
              <Text style={styles.articleSubtitle}>{item.subtitle}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const COLORS = {
  background: '#050505',
  card: '#121212',
  gold: '#D4AF37',
  white: '#FFFFFF',
  secondary: '#A6A6A6',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    color: COLORS.secondary,
    lineHeight: 22,
    marginBottom: 22,
  },
  heroCard: {
    height: 260,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  heroOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  badge: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 8,
  },
  heroTitle: {
    color: COLORS.white,
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 31,
  },
  heroText: {
    color: COLORS.white,
    lineHeight: 21,
    marginTop: 8,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 28,
    marginBottom: 14,
  },
  articleCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1F1F1F',
  },
  articleImage: {
    width: 110,
    minHeight: 120,
  },
  articleContent: {
    flex: 1,
    padding: 14,
  },
  articleTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  articleSubtitle: {
    color: COLORS.secondary,
    lineHeight: 19,
    marginTop: 6,
  },
});
