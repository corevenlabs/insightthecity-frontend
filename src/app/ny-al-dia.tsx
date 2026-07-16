import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const news = [
  {
    id: 'ny-alerts-today',
    image: 'https://images.unsplash.com/photo-1522083165195-3424ed129620',
    title: 'NYC activa alertas por clima y transporte',
    subtitle: 'Lo que debes revisar antes de salir: subway, buses, clima y cierres.',
    date: 'Jun 23, 2026',
  },
  {
    id: 'ny-alerts-today',
    image: 'https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2',
    title: 'Cambios en Midtown durante eventos masivos',
    subtitle: 'Calles cerradas, rutas alternas y recomendaciones para visitantes.',
    date: 'Jun 22, 2026',
  },
  {
    id: 'ny-weekend-plans',
    image: 'https://images.unsplash.com/photo-1518391846015-55a9cc003b25',
    title: 'Nueva York prepara experiencias para el Mundial',
    subtitle: 'Fan zones, watch parties y actividades gratuitas en varios boroughs.',
    date: 'Jun 18, 2026',
  },
  {
    id: 'nyc-local-guides',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
    title: 'Guía rápida para moverte entre NYC y NJ',
    subtitle: 'PATH, ferry, buses y opciones para llegar a tiempo.',
    date: 'Jun 17, 2026',
  },
];

export default function NyAlDiaScreen() {
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
          <Text style={styles.headerTitle}>NY al día</Text>
          <View style={{ width: 26 }} />
        </View>

        <Text style={styles.subtitle}>
          Noticias, alertas y cambios importantes para estar al día en NYC/NJ.
        </Text>

        <TouchableOpacity
          style={styles.mainCard}
          onPress={() => openExperience('ny-alerts-today')}
        >
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2' }}
            style={styles.mainImage}
          />
          <View style={styles.mainContent}>
            <Text style={styles.badge}>NUEVA YORK AL DÍA</Text>
            <Text style={styles.mainTitle}>Lo más importante para moverte hoy</Text>
            <Text style={styles.mainSubtitle}>
              Un resumen simple para entender qué está pasando en la ciudad.
            </Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Últimas noticias</Text>

        {news.map((item) => (
          <TouchableOpacity
            key={item.title}
            style={styles.newsCard}
            onPress={() => openExperience(item.id)}
          >
            <Image source={{ uri: item.image }} style={styles.newsImage} />
            <View style={styles.newsContent}>
              <Text style={styles.date}>{item.date}</Text>
              <Text style={styles.newsTitle}>{item.title}</Text>
              <Text style={styles.newsSubtitle}>{item.subtitle}</Text>
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
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    color: COLORS.secondary,
    lineHeight: 22,
    marginBottom: 22,
  },
  mainCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1F1F1F',
  },
  mainImage: {
    width: '100%',
    height: 190,
  },
  mainContent: {
    padding: 16,
  },
  badge: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 8,
  },
  mainTitle: {
    color: COLORS.white,
    fontSize: 23,
    fontWeight: '800',
    lineHeight: 28,
  },
  mainSubtitle: {
    color: COLORS.secondary,
    lineHeight: 20,
    marginTop: 8,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 28,
    marginBottom: 14,
  },
  newsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1F1F1F',
  },
  newsImage: {
    width: '100%',
    height: 145,
  },
  newsContent: {
    padding: 14,
  },
  date: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 7,
  },
  newsTitle: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
  },
  newsSubtitle: {
    color: COLORS.secondary,
    lineHeight: 20,
    marginTop: 7,
  },
});
