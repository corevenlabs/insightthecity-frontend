import { useLanguage } from '@/context/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Image, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { fetchGuides, getGuideDownload, type Guide } from '../lib/guides';

export default function GuidesScreen() {
  const { ui } = useLanguage();
  const { user, token } = useAuth();
  const [items, setItems] = useState<Guide[]>([]);
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      setItems(await fetchGuides());
    } catch (loadError) {
      setError((loadError as Error).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const filtered = useMemo(
    () => items.filter((guide) => `${guide.title} ${guide.description || ''} ${guide.category || ''}`.toLowerCase().includes(search.toLowerCase())),
    [items, search],
  );

  async function open(guide: Guide) {
    if (guide.access === 'premium' && !user?.is_premium) {
      router.push('/club-form');
      return;
    }
    if (!token) {
      router.push('/login');
      return;
    }
    setBusy(guide.id);
    setError('');
    try {
      await WebBrowser.openBrowserAsync(await getGuideDownload(guide.id, token));
    } catch (openError) {
      setError((openError as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <SafeAreaView style={s.container}>
      <ScrollView
        contentContainerStyle={s.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor={C.gold} colors={[C.gold]} />}
      >
        <View style={s.header}>
          <TouchableOpacity style={s.back} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel={ui('Volver')}>
            <Ionicons name="arrow-back" size={24} color={C.gold} />
          </TouchableOpacity>
          <Text style={s.title}>{ui('GUÍAS NYC')}</Text>
          <View style={s.back} />
        </View>
        <Text style={s.subtitle}>{ui('Descubre lugares, experiencias y secretos de Nueva York.')}</Text>
        <View style={s.search}>
          <Ionicons name="search" size={20} color={C.secondary} />
          <TextInput value={search} onChangeText={setSearch} placeholder={ui('Buscar guía...')} placeholderTextColor={C.secondary} style={s.input} />
        </View>
        {!!error && <Text style={s.error} accessibilityRole="alert">{error}</Text>}
        {loading && items.length === 0 ? (
          <View style={s.loading} accessibilityLabel={ui('Cargando guías')}><ActivityIndicator color={C.gold} /></View>
        ) : filtered.map((guide) => {
          const locked = guide.access === 'premium' && !user?.is_premium;
          return (
            <View style={s.card} key={guide.id}>
              {guide.coverUrl ? <Image source={{ uri: guide.coverUrl }} style={s.image} accessibilityLabel={guide.title} /> : (
                <View style={[s.image, s.placeholder]}><Ionicons name="document-text-outline" size={44} color={C.gold} /></View>
              )}
              <View style={s.body}>
                <View style={s.tags}>
                  <Text style={s.tag}>{guide.region}</Text><Text style={s.tag}>{guide.language.toUpperCase()}</Text>
                  {guide.access === 'premium' && <Text style={s.premium}>ITC CLUB</Text>}
                </View>
                <Text style={s.cardTitle}>{guide.title}</Text>
                {!!guide.description && <Text style={s.description}>{guide.description}</Text>}
                <Text style={s.meta}>{guide.pageCount ? `${guide.pageCount} páginas · ` : ''}{(guide.pdfSize / 1048576).toFixed(1)} MB</Text>
                <TouchableOpacity
                  disabled={busy === guide.id}
                  style={[s.button, locked && s.locked]}
                  onPress={() => void open(guide)}
                  accessibilityRole="button"
                  accessibilityLabel={locked ? ui('Suscríbete para descargar') : ui('Descargar guía PDF')}
                >
                  {busy === guide.id ? <ActivityIndicator color={locked ? C.gold : C.bg} /> : (
                    <Ionicons name={locked ? 'lock-closed' : 'download-outline'} size={19} color={locked ? C.gold : C.bg} />
                  )}
                  <Text style={[s.buttonText, locked && s.lockedText]}>{locked ? ui('SUSCRÍBETE PARA DESCARGAR') : ui('DESCARGAR GUÍA PDF')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
        {!loading && filtered.length === 0 && !error && <Text style={s.empty}>{ui('No hay guías disponibles.')}</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

const C = { bg: '#050505', card: '#121212', gold: '#D4AF37', white: '#FFFFFF', secondary: '#A6A6A6' };
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg }, content: { padding: 20, paddingBottom: 120 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, back: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  title: { color: C.white, fontSize: 28, fontWeight: '900' }, subtitle: { color: C.secondary, lineHeight: 22, marginTop: 8, marginBottom: 20 },
  search: { height: 52, borderRadius: 16, backgroundColor: C.card, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 20 }, input: { flex: 1, color: C.white, fontSize: 15, marginLeft: 10 },
  card: { backgroundColor: C.card, borderRadius: 20, overflow: 'hidden', marginBottom: 20, borderWidth: 1, borderColor: '#242424' }, image: { width: '100%', height: 210 }, placeholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#181818' }, body: { padding: 18 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, tag: { color: C.white, fontSize: 11, fontWeight: '800', backgroundColor: '#272727', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 99 }, premium: { color: C.bg, fontSize: 11, fontWeight: '900', backgroundColor: C.gold, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 99 },
  cardTitle: { color: C.white, fontSize: 21, fontWeight: '800', marginTop: 13 }, description: { color: C.secondary, lineHeight: 21, marginTop: 7 }, meta: { color: C.gold, fontSize: 12, fontWeight: '700', marginTop: 10 },
  button: { minHeight: 52, borderRadius: 14, backgroundColor: C.gold, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 18 }, locked: { backgroundColor: '#111', borderWidth: 1, borderColor: C.gold }, buttonText: { color: C.bg, fontWeight: '900', fontSize: 13 }, lockedText: { color: C.gold },
  error: { color: '#FFB4AB', marginBottom: 14 }, empty: { color: C.secondary, textAlign: 'center', marginTop: 40 }, loading: { minHeight: 180, alignItems: 'center', justifyContent: 'center' },
});
