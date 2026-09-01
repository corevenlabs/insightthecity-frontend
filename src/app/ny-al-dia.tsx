import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NewsImage } from '../components/NewsImage';
import { formatDate, useNewsFeed, type NewsCard } from '../lib/news';

export default function NyAlDiaScreen() {
  const router = useRouter();
  const feed = useNewsFeed('ny-al-dia');

  const openArticle = (id: number) => {
    router.push({ pathname: '/news-detail', params: { id: String(id), section: 'NY al día' } } as any);
  };

  // La primera nota se muestra grande; el resto en tarjetas verticales.
  const [featured, ...rest] = feed.items;

  const renderHeader = () => (
    <View>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={26} color="#D4AF37" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>NY al día</Text>
        <View style={{ width: 26 }} />
      </View>

      <Text style={styles.subtitle}>
        Noticias, alertas y lo más importante para estar al día en Nueva York.
      </Text>

      {featured && (
        <TouchableOpacity style={styles.mainCard} onPress={() => openArticle(featured.id)} activeOpacity={0.85}>
          <NewsImage
            uri={featured.image}
            style={styles.mainImage}
            accessibilityLabel={`Imagen de ${featured.title}`}
          />
          <View style={styles.mainContent}>
            <Text style={styles.badge}>NUEVA YORK AL DÍA</Text>
            <Text style={styles.mainTitle} numberOfLines={3}>
              {featured.title}
            </Text>
            {!!featured.excerpt && (
              <Text style={styles.mainSubtitle} numberOfLines={2}>
                {featured.excerpt}
              </Text>
            )}
            <Text style={styles.date}>{formatDate(featured.date)}</Text>
          </View>
        </TouchableOpacity>
      )}

      {rest.length > 0 && <Text style={styles.sectionTitle}>Últimas noticias</Text>}
    </View>
  );

  const renderItem = ({ item }: { item: NewsCard }) => (
    <TouchableOpacity style={styles.newsCard} onPress={() => openArticle(item.id)} activeOpacity={0.85}>
      <NewsImage
        uri={item.image}
        style={styles.newsImage}
        accessibilityLabel={`Imagen de ${item.title}`}
      />
      <View style={styles.newsContent}>
        <Text style={styles.date}>{formatDate(item.date)}</Text>
        <Text style={styles.newsTitle} numberOfLines={2}>
          {item.title}
        </Text>
        {!!item.excerpt && (
          <Text style={styles.newsSubtitle} numberOfLines={2}>
            {item.excerpt}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  // Carga inicial.
  if (feed.loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="arrow-back" size={26} color="#D4AF37" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>NY al día</Text>
          <View style={{ width: 26 }} />
        </View>
        <View style={styles.center}>
          <ActivityIndicator color="#D4AF37" size="large" />
        </View>
      </SafeAreaView>
    );
  }

  // Error en carga inicial (sin nada que mostrar).
  if (feed.error && feed.items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="arrow-back" size={26} color="#D4AF37" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>NY al día</Text>
          <View style={{ width: 26 }} />
        </View>
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={44} color="#555" />
          <Text style={styles.errorText}>{feed.error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={feed.retry}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <FlatList
        data={rest}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onEndReached={feed.loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={feed.refreshing} onRefresh={feed.refresh} tintColor="#D4AF37" />
        }
        ListFooterComponent={
          feed.loadingMore ? (
            <ActivityIndicator color="#D4AF37" style={{ marginVertical: 24 }} />
          ) : (
            <View style={{ height: 100 }} />
          )
        }
      />
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
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 14 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  headerTitle: { color: COLORS.white, fontSize: 30, fontWeight: '800' },
  subtitle: { color: COLORS.secondary, lineHeight: 22, marginBottom: 22 },
  mainCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1F1F1F',
  },
  mainImage: { width: '100%', height: 190, backgroundColor: '#1A1A1A' },
  mainContent: { padding: 16 },
  badge: { color: COLORS.gold, fontSize: 11, fontWeight: '800', marginBottom: 8 },
  mainTitle: { color: COLORS.white, fontSize: 22, fontWeight: '800', lineHeight: 27 },
  mainSubtitle: { color: COLORS.secondary, lineHeight: 20, marginTop: 8 },
  sectionTitle: { color: COLORS.white, fontSize: 20, fontWeight: '800', marginTop: 28, marginBottom: 14 },
  newsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1F1F1F',
  },
  newsImage: { width: '100%', height: 145, backgroundColor: '#1A1A1A' },
  newsContent: { padding: 14 },
  date: { color: COLORS.gold, fontSize: 12, fontWeight: '700', marginTop: 8 },
  newsTitle: { color: COLORS.white, fontSize: 17, fontWeight: '700', marginTop: 4 },
  newsSubtitle: { color: COLORS.secondary, lineHeight: 20, marginTop: 7 },
  errorText: { color: COLORS.secondary, textAlign: 'center', lineHeight: 21 },
  retryBtn: {
    marginTop: 6,
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: COLORS.gold,
  },
  retryText: { color: '#000', fontWeight: '800' },
});
