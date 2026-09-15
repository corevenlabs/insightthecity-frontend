import { ExperienceTags } from '@/components/ExperienceTags';
import { TagFilter } from '@/components/TagFilter';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import type { Experience } from '../../constants/experiences';
import { getExperienceTags, matchesExperienceTags } from '../../lib/experienceFilters';
import { fetchExperiences } from '../../lib/experiences';

const CONTENT_SECTIONS = new Set(['ny_al_dia', 'que_hacer', 'guias']);

export default function ExploreScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [items, setItems] = useState<Experience[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    void fetchExperiences()
      .then((records) => {
        if (active) setItems(records.filter((item) => !item.section || !CONTENT_SECTIONS.has(item.section)));
      })
      .catch(() => undefined)
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []));

  const searchResults = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter((event) => !term || [event.title, event.location, ...getExperienceTags(event)]
      .some((value) => value?.toLowerCase().includes(term)));
  }, [items, search]);
  const filteredEvents = useMemo(
    () => searchResults.filter((event) => matchesExperienceTags(event, selectedFilter)),
    [searchResults, selectedFilter],
  );

  const openExperience = (id: string) => {
    router.push({ pathname: '/experience-detail', params: { id } } as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Volver">
            <Ionicons name="arrow-back" size={24} color="#D4AF37" />
          </TouchableOpacity>
          <Text style={styles.title}>{t('explore.title')}</Text>
          <View style={styles.iconButton} />
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#999" />
          <TextInput
            placeholder={t('explore.search')}
            placeholderTextColor="#777"
            style={styles.input}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
        </View>

        <TagFilter items={searchResults} selected={selectedFilter} onChange={setSelectedFilter} />

        <Text style={styles.results}>{t('explore.results', { count: filteredEvents.length })}</Text>

        {loading ? (
          <View style={styles.state}><ActivityIndicator color="#D4AF37" /></View>
        ) : filteredEvents.length === 0 ? (
          <View style={styles.state}>
            <Ionicons name="location-outline" size={30} color="#777" />
            <Text style={styles.emptyText}>No hay eventos para este filtro.</Text>
          </View>
        ) : filteredEvents.map((event) => (
          <TouchableOpacity
            key={event.id}
            style={styles.card}
            onPress={() => openExperience(event.id)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`${event.title}, ${event.region ?? 'NY'}, ${event.location}`}
          >
            <Image source={{ uri: event.image }} style={styles.image} />
            <View style={styles.cardContent}>
              <View style={styles.topRow}>
                <View style={styles.categoryRow}>
                  <View style={styles.regionBadge}><Text style={styles.regionBadgeText}>{event.region ?? 'NY'}</Text></View>
                  <ExperienceTags tags={getExperienceTags(event)} />
                </View>
                <View style={[styles.badge, event.access === 'premium' ? styles.premiumBadge : styles.freeBadge]}>
                  <Text style={[styles.badgeText, event.access === 'premium' && styles.premiumBadgeText]}>
                    {event.access === 'premium' ? user?.is_premium ? 'ITC CLUB' : 'PREMIUM' : 'GRATIS'}
                  </Text>
                </View>
              </View>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={15} color="#A6A6A6" />
                <Text style={styles.location}>{event.location}</Text>
              </View>
              <Text style={styles.time}>{event.date}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505' },
  content: { paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  iconButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  title: { color: '#FFF', fontSize: 32, fontWeight: '700' },
  searchBox: { minHeight: 48, flexDirection: 'row', alignItems: 'center', backgroundColor: '#141414', borderRadius: 14, paddingHorizontal: 14, marginTop: 20, marginBottom: 16 },
  input: { flex: 1, color: '#FFF', paddingVertical: 14, marginLeft: 10, fontSize: 16 },
  tabsContainer: { marginBottom: 15 },
  tabsContent: { paddingRight: 10 },
  tab: { minHeight: 44, justifyContent: 'center', backgroundColor: '#1A1A1A', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, marginRight: 10 },
  activeTab: { backgroundColor: '#D4AF37' },
  tabText: { color: '#AAA', fontWeight: '600' },
  activeTabText: { color: '#000' },
  results: { color: '#888', marginBottom: 15 },
  state: { minHeight: 180, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { color: '#A6A6A6', fontSize: 15 },
  card: { backgroundColor: '#121212', borderRadius: 20, overflow: 'hidden', marginBottom: 18 },
  image: { width: '100%', height: 180, backgroundColor: '#1A1A1A' },
  cardContent: { padding: 16 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  categoryRow: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  category: { flexShrink: 1, color: '#D4AF37', fontWeight: '700' },
  regionBadge: { minWidth: 38, paddingHorizontal: 9, paddingVertical: 5, alignItems: 'center', borderRadius: 999, backgroundColor: '#D4AF37' },
  regionBadgeText: { color: '#050505', fontSize: 11, fontWeight: '900' },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  freeBadge: { backgroundColor: '#D4AF37' },
  premiumBadge: { backgroundColor: '#303030', borderWidth: 1, borderColor: '#D4AF37' },
  badgeText: { color: '#000', fontSize: 11, fontWeight: '700' },
  premiumBadgeText: { color: '#D4AF37' },
  eventTitle: { color: '#FFF', fontSize: 18, fontWeight: '700', marginTop: 12 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 },
  location: { flex: 1, color: '#AAA' },
  time: { color: '#AAA', marginTop: 4 },
});
