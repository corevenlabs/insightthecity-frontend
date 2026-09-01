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

export default function QueHacerScreen() {
  const router = useRouter();
  const feed = useNewsFeed('que-hacer');

  const openArticle = (id: number) => {
    router.push({ pathname: '/news-detail', params: { id: String(id), section: '¿Qué hacer en NY?' } } as any);
  };

  const [featured, ...rest] = feed.items;

  const backHeader = (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
        <Ionicons name="arrow-back" size={26} color="#D4AF37" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>¿Qué hacer en NY?</Text>
      <View style={{ width: 26 }} />
    </View>
  );

  const renderHeader = () => (
    <View>
      {backHeader}
      <Text style={styles.subtitle}>
        Planes, eventos y experiencias para vivir Nueva York con intención.
      </Text>

      {featured && (
        <TouchableOpacity style={styles.heroCard} onPress={() => openArticle(featured.id)} activeOpacity={0.85}>
          <NewsImage
            uri={featured.image}
            style={styles.heroImage}
            accessibilityLabel={`Imagen de ${featured.title}`}
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.badge}>QUE HACER EN NY</Text>
            <Text style={styles.heroTitle} numberOfLines={3}>
              {featured.title}
            </Text>
            <Text style={styles.heroDate}>{formatDate(featured.date)}</Text>
          </View>
        </TouchableOpacity>
      )}

      {rest.length > 0 && <Text style={styles.sectionTitle}>Últimos planes</Text>}
    </View>
  );

  const renderItem = ({ item }: { item: NewsCard }) => (
    <TouchableOpacity style={styles.articleCard} onPress={() => openArticle(item.id)} activeOpacity={0.85}>
      <NewsImage
        uri={item.image}
        style={styles.articleImage}
        accessibilityLabel={`Imagen de ${item.title}`}
      />
      <View style={styles.articleContent}>
        <Text style={styles.badge}>{formatDate(item.date)}</Text>
        <Text style={styles.articleTitle} numberOfLines={2}>
          {item.title}
        </Text>
        {!!item.excerpt && (
          <Text style={styles.articleSubtitle} numberOfLines={2}>
            {item.excerpt}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (feed.loading) {
    return (
      <SafeAreaView style={styles.container}>
        {backHeader}
        <View style={styles.center}>
          <ActivityIndicator color="#D4AF37" size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (feed.error && feed.items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        {backHeader}
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
  headerTitle: { color: COLORS.white, fontSize: 26, fontWeight: '800' },
  subtitle: { color: COLORS.secondary, lineHeight: 22, marginBottom: 22 },
  heroCard: { height: 260, borderRadius: 20, overflow: 'hidden', backgroundColor: COLORS.card },
  heroImage: { width: '100%', height: '100%', position: 'absolute' },
  heroOverlay: { flex: 1, justifyContent: 'flex-end', padding: 20, backgroundColor: 'rgba(0,0,0,0.55)' },
  badge: { color: COLORS.gold, fontSize: 11, fontWeight: '800', marginBottom: 8 },
  heroTitle: { color: COLORS.white, fontSize: 24, fontWeight: '800', lineHeight: 29 },
  heroDate: { color: COLORS.gold, fontSize: 12, fontWeight: '700', marginTop: 10 },
  sectionTitle: { color: COLORS.white, fontSize: 20, fontWeight: '800', marginTop: 28, marginBottom: 14 },
  articleCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1F1F1F',
  },
  articleImage: { width: 110, minHeight: 120, backgroundColor: '#1A1A1A' },
  articleContent: { flex: 1, padding: 14 },
  articleTitle: { color: COLORS.white, fontSize: 16, fontWeight: '700', marginTop: 4 },
  articleSubtitle: { color: COLORS.secondary, lineHeight: 19, marginTop: 6 },
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
