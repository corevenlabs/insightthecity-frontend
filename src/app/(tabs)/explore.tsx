import { Text, TextInput } from '../../components/typography';
import { AdaptiveGrid } from '../../components/AdaptiveGrid';
import { BenefitPreview } from '../../components/BenefitPreview';
import { TagFilter } from '@/components/TagFilter';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../../context/LanguageContext';
import type { Experience } from '../../constants/experiences';
import { getExperienceTags, matchesExperienceTags } from '../../lib/experienceFilters';
import { fetchExperiences } from '../../lib/experiences';

const CONTENT_SECTIONS = new Set(['ny_al_dia', 'que_hacer']);

export default function ExploreScreen() {
  const router = useRouter();
  const { t, ui, language } = useLanguage();
  const [items, setItems] = useState<Experience[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    void fetchExperiences(undefined, language)
      .then((records) => {
        if (active) setItems(records.filter((item) => !item.section || !CONTENT_SECTIONS.has(item.section)));
      })
      .catch(() => undefined)
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [language]));

  const searchResults = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter((event) => !term || [event.title, event.location, ...getExperienceTags(event)]
      .some((value) => value?.toLowerCase().includes(term)));
  }, [items, search]);
  const filteredEvents = useMemo(
    () => searchResults.filter((event) => matchesExperienceTags(event, selectedFilter)),
    [searchResults, selectedFilter],
  );


  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel={ui("Volver")}>
            <Ionicons name="arrow-back" size={24} color="#FDDD56" />
          </TouchableOpacity>
          <Text style={styles.title}>{t('explore.title')}</Text>
          <View style={styles.iconButton} />
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#999" />
          <TextInput
            placeholder={t('explore.search')}
            accessibilityLabel={t('explore.search')}
            placeholderTextColor="#8A8A8A"
            style={styles.input}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
        </View>

        <TagFilter items={searchResults} selected={selectedFilter} onChange={setSelectedFilter} />

        <Text style={styles.results}>{t('explore.results', { count: filteredEvents.length })}</Text>

        {loading ? (
          <View style={styles.state}><ActivityIndicator color="#FDDD56" /></View>
        ) : filteredEvents.length === 0 ? (
          <View style={styles.state}>
            <Ionicons name="location-outline" size={30} color="#777" />
            <Text style={styles.emptyText}>{ui("No hay eventos para este filtro.")}</Text>
          </View>
        ) : <AdaptiveGrid>{filteredEvents.map((event) => (
          <BenefitPreview key={event.id} experience={event} variant="grid" />
        ))}</AdaptiveGrid>}

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
  title: { flexShrink: 1, textAlign: 'center', color: '#FFF', fontSize: 32, fontWeight: '700' },
  searchBox: { minHeight: 48, flexDirection: 'row', alignItems: 'center', backgroundColor: '#141414', borderRadius: 14, paddingHorizontal: 14, marginTop: 20, marginBottom: 16 },
  input: { flex: 1, color: '#FFF', paddingVertical: 14, marginLeft: 10, fontSize: 16 },
  tabsContainer: { marginBottom: 15 },
  tabsContent: { paddingRight: 10 },
  tab: { minHeight: 44, justifyContent: 'center', backgroundColor: '#1A1A1A', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, marginRight: 10 },
  activeTab: { backgroundColor: '#FDDD56' },
  tabText: { color: '#AAA', fontWeight: '600' },
  activeTabText: { color: '#000' },
  results: { color: '#888', marginBottom: 15 },
  state: { minHeight: 180, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { color: '#A6A6A6', fontSize: 15 },
});
