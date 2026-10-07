import { AdaptiveGrid } from '../../components/AdaptiveGrid';
import { useSaved } from '../../context/SavedContext';
import { NewsImage } from '../../components/NewsImage';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLanguage } from '../../context/LanguageContext';

export default function SavedScreen() {
  const { ui } = useLanguage();
  const { items, ready } = useSaved();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>{ui('Guardados')}</Text>
        <Text style={styles.subtitle}>
          {ui('Tus lugares, beneficios y planes favoritos.')}
        </Text>
      </View>

      {!ready ? <ActivityIndicator color="#FDDD56" style={{ marginTop: 40 }} /> : items.length > 0 ? (
        <ScrollView contentContainerStyle={{ paddingVertical: 20, gap: 14, paddingBottom: 120 }}>
          <AdaptiveGrid>{items.map(item => <View key={item.key} style={{ borderRadius: 14, overflow: 'hidden', backgroundColor: '#121212' }}>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={item.title} onPress={() => router.push(item.kind === 'experience'
              ? { pathname: '/experience-detail', params: { id: item.id } }
              : { pathname: '/news-detail', params: { id: item.id, section: '¿Qué hacer en NY?', source: 'que-hacer' } })}>
              <NewsImage uri={item.image} style={{ width: '100%', aspectRatio: 1.8 }} accessibilityLabel={item.title} />
              <Text style={{ color: '#FFFFFF', fontSize: 17, padding: 14 }}>{item.title}</Text>
            </TouchableOpacity>

          </View>)}</AdaptiveGrid>
        </ScrollView>
      ) : <View style={styles.emptyState}>
        <View style={styles.iconCircle}>
          <Ionicons name="bookmark-outline" size={30} color="#FDDD56" />
        </View>
        <Text style={styles.emptyTitle}>{ui('Aún no tienes elementos guardados')}</Text>
        <Text style={styles.emptyText}>
          {ui('Explora la ciudad y utiliza el marcador para guardar lo que quieras visitar después.')}
        </Text>
        <TouchableOpacity
          style={styles.exploreButton}
          activeOpacity={0.78}
          accessibilityRole="button"
          onPress={() => router.push('/explore')}
        >
          <Text style={styles.exploreButtonText}>{ui('EXPLORAR')}</Text>
        </TouchableOpacity>
      </View>}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#050505',
  },
  header: {
    paddingTop: 18,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 7,
    color: '#A6A6A6',
    fontSize: 14,
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  iconCircle: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#3A3115',
    backgroundColor: '#121212',
  },
  emptyTitle: {
    marginTop: 18,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyText: {
    maxWidth: 310,
    marginTop: 8,
    color: '#A6A6A6',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  exploreButton: {
    minWidth: 150,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    paddingHorizontal: 20,
    borderRadius: 23,
    backgroundColor: '#FDDD56',
  },
  exploreButtonText: {
    color: '#050505',
    fontSize: 13,
    fontWeight: '800',
  },
});
