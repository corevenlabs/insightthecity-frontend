import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { Experience } from '../constants/experiences';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { availableExperienceTags } from '../lib/experienceFilters';
import { findHomeResults, searchCatalog, type SearchItem } from '../lib/homeSearch';
import type { Guide } from '../lib/guides';
import { fetchNews, type NewsCard } from '../lib/news';
import { NewsImage } from './NewsImage';
import { TagFilter } from './TagFilter';

export function HomeSearch({ experiences, guides, tags, query, onQueryChange, onTagsChange, catalogLoading, catalogError, onRetryCatalog, isOpen, onOpenChange }: {
  experiences: Experience[]; guides: Guide[]; tags: string[];
  catalogLoading: boolean; catalogError: boolean; onRetryCatalog: () => void;
  query: string; onQueryChange: (query: string) => void; onTagsChange: (tags: string[]) => void;
  isOpen: boolean; onOpenChange: (open: boolean) => void;
}) {
  const { ui, tagLabel } = useLanguage();
  const { user } = useAuth();
  const setQuery = onQueryChange;
  const [focused, setFocused] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [plans, setPlans] = useState<NewsCard[]>([]);
  const [news, setNews] = useState<NewsCard[]>([]);
  const [loadKey, setLoadKey] = useState(0);
  const [requested, setRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const input = useRef<TextInput>(null);
  const recentKey = `itc:recent-searches:${user?.id ?? 'guest'}`;
  const active = query.trim().length > 0;
  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(recentKey).then(raw => {
      const values: unknown = raw ? JSON.parse(raw) : [];
      if (alive && Array.isArray(values)) setRecent(values.filter((value): value is string => typeof value === 'string').slice(0, 5));
    }).catch(() => undefined);
    return () => { alive = false; };
  }, [recentKey]);
  useEffect(() => {
    if (!requested) return;
    let alive = true;
    async function load(section: string, update: (items: NewsCard[]) => void) {
      const items: NewsCard[] = [];
      let page = 1;
      let totalPages = 1;
      do {
        const result = await fetchNews(section, page, 20);
        if (!alive) return;
        items.push(...result.items);
        update([...new Map(items.map(item => [item.id, item])).values()]);
        totalPages = result.totalPages;
        page++;
      } while (page <= totalPages);
    }
    Promise.allSettled([load('que-hacer', setPlans), load('ny-al-dia', setNews)]).then(results => {
      if (alive) { setFailed(results.some(result => result.status === 'rejected')); setLoading(false); }
    });
    return () => { alive = false; };
  }, [requested, loadKey]);
  const catalog = useMemo(() => searchCatalog(experiences, guides, plans, news), [experiences, guides, plans, news]);
  const results = useMemo(() => findHomeResults(catalog, query, tags), [catalog, query, tags]);
  const suggestions = active ? [...new Set(results.map(item => item.title))].slice(0, 4) :
    availableExperienceTags(experiences).filter(tag => experiences.some(item => `${item.category} ${(item.tags ?? []).join(' ')}`.toLowerCase().includes(tag.toLowerCase()))).slice(0, 4);
  const remember = (value: string) => {
    const term = value.trim();
    if (!term) return;
    const next = [term, ...recent.filter(item => item.toLowerCase() !== term.toLowerCase())].slice(0, 5);
    setRecent(next); void AsyncStorage.setItem(recentKey, JSON.stringify(next)).catch(() => undefined);
  };
  const close = () => { input.current?.blur(); Keyboard.dismiss(); setFocused(false); onOpenChange(false); };
  const choose = (value: string) => { onOpenChange(true); setQuery(value); remember(value); if (!requested) setLoading(true); setRequested(true); };
  const open = (item: SearchItem) => {
    remember(query); Keyboard.dismiss();
    if (item.kind === 'experience') router.push({ pathname: '/experience-detail', params: { id: item.id } });
    else if (item.kind === 'guide') router.push({ pathname: '/guides', params: { searchQuery: item.title } });
    else router.push({ pathname: '/news-detail', params: { id: item.id, source: item.kind, section: item.kind === 'que-hacer' ? ui('QUÉ HACER EN NEW YORK') : ui('NY AL DÍA') } });
  };
  const label = (kind: SearchItem['kind']) => ui(kind === 'guide' ? 'Guías' : kind === 'que-hacer' ? 'Qué hacer en New York' : kind === 'ny-al-dia' ? 'NY al día' : 'Lugares y beneficios');
  return <View onTouchStart={event => event.stopPropagation()}>
    <View style={[s.search, focused && s.focused]}>
      <Ionicons name="search-outline" size={23} color="#A6A6A6" accessible={false} />
      <TextInput ref={input} value={query} onChangeText={setQuery} onFocus={() => { onOpenChange(true); setFocused(true); if (!requested) setLoading(true); setRequested(true); }} onBlur={() => setFocused(false)}
        onSubmitEditing={() => { remember(query); input.current?.blur(); }} returnKeyType="search" autoCorrect={false}
        placeholder={ui('Buscar lugares, eventos y guías')} placeholderTextColor="#A6A6A6" accessibilityLabel={ui('Buscar lugares, eventos y guías')} style={s.input} />
      {!!query && <TouchableOpacity style={s.iconButton} onPress={() => { setQuery(''); close(); }} accessibilityRole="button" accessibilityLabel={ui('Borrar búsqueda')}><Ionicons name="close-circle" size={22} color="#A6A6A6" /></TouchableOpacity>}
    </View>
    <View style={s.filters}><TagFilter items={experiences} selected={tags} onChange={onTagsChange} /></View>
    {isOpen && <View style={s.panel}>
      <View style={s.headingRow}>
        <Text style={s.heading}>{ui('Buscar')}</Text>
        <TouchableOpacity style={s.closeButton} onPress={close} accessibilityRole="button" accessibilityLabel={ui('Cerrar búsqueda')}>
          <Text style={s.closeText}>{ui('Cerrar')}</Text><Ionicons name="close-outline" size={20} color="#FDDD56" accessible={false} />
        </TouchableOpacity>
      </View>
      {!active && recent.length > 0 && <>
        <View style={s.headingRow}><Text style={s.heading}>{ui('Búsquedas recientes')}</Text><TouchableOpacity style={s.iconButton} onPress={() => { setRecent([]); void AsyncStorage.removeItem(recentKey).catch(() => undefined); }} accessibilityRole="button" accessibilityLabel={ui('Borrar búsquedas recientes')}><Ionicons name="trash-outline" size={19} color="#FDDD56" /></TouchableOpacity></View>
        {recent.map(term => <TouchableOpacity key={term} style={s.suggestion} onPress={() => choose(term)} accessibilityRole="button"><Ionicons name="time-outline" size={18} color="#A6A6A6" /><Text style={s.suggestionText}>{term}</Text></TouchableOpacity>)}
      </>}
      {suggestions.length > 0 && <><Text style={s.heading}>{ui('Sugerencias')}</Text>{suggestions.map(term => <TouchableOpacity key={term} style={s.suggestion} onPress={() => choose(term)} accessibilityRole="button"><Ionicons name="search-outline" size={18} color="#FDDD56" /><Text style={s.suggestionText}>{active ? term : tagLabel(term)}</Text><Ionicons name="arrow-up-outline" size={17} color="#A6A6A6" /></TouchableOpacity>)}</>}
      {active && <>
        <Text style={s.heading} accessibilityLiveRegion="polite">{ui('Resultados')} · {results.length}</Text>
        {results.map(item => <TouchableOpacity key={item.key} style={s.result} onPress={() => open(item)} accessibilityRole="button" accessibilityLabel={`${label(item.kind)}: ${item.title}`}>
          <NewsImage uri={item.image} style={s.image} accessibilityLabel={item.title} />
          <View style={s.resultText}><Text style={s.kind}>{label(item.kind)}</Text><Text style={s.title} numberOfLines={2}>{item.title}</Text><Text style={s.description} numberOfLines={2}>{item.description}</Text></View>
          <Ionicons name="chevron-forward" size={18} color="#FDDD56" accessible={false} />
        </TouchableOpacity>)}
        {(loading || catalogLoading) && <View style={s.status}><ActivityIndicator color="#FDDD56" /><Text style={s.description}>{ui('Cargando contenido…')}</Text></View>}
        {!loading && !catalogLoading && !failed && !catalogError && results.length === 0 && <Text style={s.description}>{ui('No encontramos resultados. Prueba otra búsqueda o cambia los filtros.')}</Text>}
      </>}
      {(failed || catalogError) && <TouchableOpacity style={s.suggestion} onPress={() => { if (failed) { setLoading(true); setFailed(false); setLoadKey(key => key + 1); } if (catalogError) onRetryCatalog(); }} accessibilityRole="button"><Ionicons name="refresh-outline" size={18} color="#FDDD56" /><Text style={s.suggestionText}>{ui('No se pudo cargar todo el contenido. Reintentar')}</Text></TouchableOpacity>}
    </View>}
  </View>;
}
const s = StyleSheet.create({
  search: { marginTop: 8, minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 16, paddingRight: 6, borderRadius: 28, borderWidth: 1, borderColor: '#3A3A3A', backgroundColor: '#232323' },
  focused: { borderColor: '#FDDD56' }, input: { flex: 1, minWidth: 0, color: '#FFF', fontSize: 16, paddingVertical: 14 }, iconButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  filters: { marginTop: 10 }, panel: { backgroundColor: '#121212', padding: 14, borderRadius: 18, marginBottom: 20, gap: 8 },
  headingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, heading: { color: '#FFF', fontSize: 15, fontWeight: '600', marginTop: 6 },
  closeButton: { minHeight: 44, minWidth: 44, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }, closeText: { color: '#FDDD56', fontSize: 14 },
  suggestion: { minHeight: 44, flexDirection: 'row', gap: 10, alignItems: 'center' }, suggestionText: { color: '#EAEAEA', fontSize: 15, flex: 1 },
  result: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#303030' }, image: { width: 72, height: 82, borderRadius: 10 }, resultText: { flex: 1, minWidth: 0, gap: 4 },
  kind: { color: '#FDDD56', fontSize: 12 }, title: { color: '#FFF', fontSize: 16, fontWeight: '600' }, description: { color: '#B5B5B5', fontSize: 14, lineHeight: 20 }, status: { flexDirection: 'row', gap: 10, alignItems: 'center', paddingVertical: 12 },
});
