import { useEffect, useState } from 'react';
import { fetchExperience } from '../../lib/experiences';
import { fetchArticle, formatDate, type NewsCard } from '../../lib/news';
import type { Experience } from '../../constants/experiences';
import { BenefitPreview } from '../../components/BenefitPreview';
import { SaveButton } from '../../components/SaveButton';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenBackButton } from '../../components/ScreenBackButton';
import { Text } from '../../components/typography';
import { AdaptiveGrid } from '../../components/AdaptiveGrid';
import { useSaved, type SavedItem } from '../../context/SavedContext';
import { NewsImage } from '../../components/NewsImage';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLanguage } from '../../context/LanguageContext';

export default function SavedScreen() {
  const { ui, language } = useLanguage();
  const { fontScale } = useWindowDimensions();
  const { items, ready } = useSaved();
  const [loaded, setLoaded] = useState<{ items: SavedItem[]; language: string; data: Record<string, Experience | NewsCard> } | null>(null);
  useEffect(() => {
    let active = true;
    void Promise.all(items.map(async item => {
      try { return [item.key, item.kind === 'plan' ? await fetchArticle(item.id, language) : await fetchExperience(item.id, language)] as const; }
      catch { return [item.key, item.experience ?? item.plan] as const; }
    })).then(entries => { if (active) setLoaded({ items, language, data: Object.fromEntries(entries.filter((entry): entry is readonly [string, Experience | NewsCard] => !!entry[1])) }); });
    return () => { active = false; };
  }, [items, language]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.titleRow}><ScreenBackButton /><Text style={styles.title}>{ui('Guardados')}</Text></View>
        <Text style={styles.subtitle}>
          {ui('Tus lugares, beneficios y planes favoritos.')}
        </Text>
      </View>

      {!ready ? <ActivityIndicator color="#FDDD56" style={{ marginTop: 40 }} /> : items.length > 0 ? (
        <ScrollView contentContainerStyle={{ paddingVertical: 20, gap: 14, paddingBottom: 120 }}>
          <AdaptiveGrid>{items.map(item => {
            const content = loaded?.items === items && loaded.language === language ? loaded.data[item.key] : undefined;
            if (item.kind === 'experience') {
              const experience = (content ?? item.experience ?? { id: item.id, title: item.title, image: item.image || '', category: '', date: '', location: '', access: 'free', description: '', includes: [], recommendation: '' }) as Experience;
              return <BenefitPreview key={item.key} experience={experience} variant="grid" />;
            }
            const plan = (content ?? item.plan) as NewsCard | undefined;
            const title = plan?.title ?? item.title;
            return <View key={item.key} style={styles.planCard}>
              <TouchableOpacity style={[styles.planPhoto, { minHeight: Math.max(250, 250 * fontScale) }]} accessibilityRole="button" accessibilityLabel={title} activeOpacity={0.85} onPress={() => router.push({ pathname: '/news-detail', params: { id: item.id, section: '¿Qué hacer en NY?', source: 'que-hacer' } })}>
                <NewsImage uri={plan?.image ?? item.image} style={styles.planImage} accessibilityLabel={title} />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.94)']} style={StyleSheet.absoluteFill} />
                <View style={styles.planBody}>
                  {!!plan?.date && <Text style={styles.planDate}>{formatDate(plan.date, language)}</Text>}
                  <Text style={styles.planTitle} numberOfLines={3}>{title}</Text>
                  {!!plan?.excerpt && <Text style={styles.planDescription} numberOfLines={2}>{plan.excerpt}</Text>}
                </View>
              </TouchableOpacity>
              <SaveButton item={item} />
            </View>;
          })}</AdaptiveGrid>
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
  planCard: { borderRadius: 18, overflow: 'hidden', backgroundColor: '#121212', borderWidth: StyleSheet.hairlineWidth, borderColor: '#333', marginBottom: 16 },
  planPhoto: { width: '100%', aspectRatio: 1.36 },
  planImage: { width: '100%', height: '100%' },
  planBody: { position: 'absolute', bottom: 16, left: 16, right: 16, gap: 6 },
  planDate: { color: '#FDDD56', fontSize: 13, lineHeight: 18 },
  planTitle: { color: '#FFF', fontSize: 19, lineHeight: 24, fontWeight: '700' },
  planDescription: { color: '#FFF', fontSize: 13, lineHeight: 18 },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#050505',
  },
  header: {
    paddingTop: 18,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: {
    flex: 1,
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
