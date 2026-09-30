import { useLanguage } from '@/context/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { confirmGuidePurchase, createGuidePurchase, fetchGuides, getGuideDownload, type Guide } from '../lib/guides';

const price = (guide: Guide) => `${guide.currency.toUpperCase()} $${(guide.priceCents / 100).toFixed(2)}`;

export default function GuidesScreen() {
  const { ui } = useLanguage();
  const { user, token } = useAuth();
  const params = useLocalSearchParams<{ purchaseSession?: string; guideId?: string }>();
  const confirmedSession = useRef<string | null>(null);
  const [items, setItems] = useState<Guide[]>([]);
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true); else setLoading(true);
    setError('');
    try { setItems(await fetchGuides(token)); }
    catch (loadError) { setError((loadError as Error).message); }
    finally { setLoading(false); setRefreshing(false); }
  }, [token]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  useEffect(() => {
    const session = Array.isArray(params.purchaseSession) ? params.purchaseSession[0] : params.purchaseSession;
    const rawGuideId = Array.isArray(params.guideId) ? params.guideId[0] : params.guideId;
    const guideId = Number(rawGuideId);
    if (!session || !guideId || !token || confirmedSession.current === session) return;
    confirmedSession.current = session;
    setBusy(guideId);
    confirmGuidePurchase(guideId, session, token)
      .then(async () => {
        await load();
        Alert.alert(ui('Compra confirmada'), ui('La guía ya está disponible en tu cuenta.'));
      })
      .catch((purchaseError) => setError((purchaseError as Error).message))
      .finally(() => setBusy(null));
  }, [params.purchaseSession, params.guideId, token, load, ui]);

  const filtered = useMemo(
    () => items.filter((guide) => `${guide.title} ${guide.description || ''} ${guide.category || ''}`.toLowerCase().includes(search.toLowerCase())),
    [items, search],
  );

  const owns = (guide: Guide) => guide.access === 'free' || !!guide.isPurchased || (!!user?.is_premium && guide.includedInMembership);

  async function download(guide: Guide) {
    if (!token) return router.push('/login');
    setBusy(guide.id); setError('');
    try { await WebBrowser.openBrowserAsync(await getGuideDownload(guide.id, token)); }
    catch (openError) { setError((openError as Error).message); }
    finally { setBusy(null); }
  }

  async function purchase(guide: Guide) {
    if (!token) return router.push('/login');
    setBusy(guide.id); setError('');
    try {
      const result = await createGuidePurchase(guide.id, token);
      if (result.alreadyOwned) return void load();
      if (!result.checkoutUrl) throw new Error(ui('No se pudo iniciar la compra.'));
      router.push({ pathname: '/checkout', params: { url: result.checkoutUrl, mode: 'guide', guideId: String(guide.id) } });
    } catch (purchaseError) { setError((purchaseError as Error).message); setBusy(null); }
  }

  return <SafeAreaView style={s.container}>
    <ScrollView contentContainerStyle={s.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor={C.gold} colors={[C.gold]} />}>
      <View style={s.header}><TouchableOpacity style={s.back} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel={ui('Volver')}><Ionicons name="arrow-back" size={24} color={C.gold} /></TouchableOpacity><Text style={s.title}>{ui('GUÍAS NYC')}</Text><View style={s.back} /></View>
      <Text style={s.subtitle}>{ui('Compra una guía individual o disfrútala incluida con tu membresía ITC Club.')}</Text>
      <View style={s.search}><Ionicons name="search" size={20} color={C.secondary} /><TextInput value={search} onChangeText={setSearch} placeholder={ui('Buscar guía...')} placeholderTextColor={C.secondary} style={s.input} /></View>
      {!!error && <Text style={s.error} accessibilityRole="alert">{error}</Text>}
      {loading && items.length === 0 ? <View style={s.loading} accessibilityLabel={ui('Cargando guías')}><ActivityIndicator color={C.gold} /></View> : filtered.map((guide) => {
        const available = owns(guide);
        return <View style={s.card} key={guide.id}>
          {guide.coverUrl ? <Image source={{ uri: guide.coverUrl }} style={s.image} resizeMode="contain" accessibilityLabel={guide.title} /> : <View style={[s.image, s.placeholder]}><Ionicons name="document-text-outline" size={44} color={C.gold} /></View>}
          <View style={s.body}>
            <View style={s.tags}><Text style={s.tag}>{guide.region}</Text><Text style={s.tag}>{guide.language.toUpperCase()}</Text>{guide.includedInMembership && <Text style={s.premium}>ITC CLUB</Text>}{guide.isPurchased && <Text style={s.owned}>{ui('COMPRADA')}</Text>}</View>
            <Text style={s.cardTitle}>{guide.title}</Text>
            {!!guide.description && <Text style={s.description}>{guide.description}</Text>}
            <View style={s.commerceRow}><Text style={s.meta}>{guide.pageCount ? `${guide.pageCount} páginas · ` : ''}{(guide.pdfSize / 1048576).toFixed(1)} MB</Text>{guide.access !== 'free' && guide.individualPurchaseEnabled && <Text style={s.price}>{price(guide)}</Text>}</View>
            {available ? <TouchableOpacity disabled={busy === guide.id} style={s.button} onPress={() => void download(guide)} accessibilityRole="button" accessibilityLabel={ui('Descargar guía PDF')}>{busy === guide.id ? <ActivityIndicator color={C.bg} /> : <Ionicons name="download-outline" size={20} color={C.bg} />}<Text style={s.buttonText}>{ui('DESCARGAR GUÍA PDF')}</Text></TouchableOpacity> : <>
              {guide.individualPurchaseEnabled && <TouchableOpacity disabled={busy === guide.id} style={s.button} onPress={() => void purchase(guide)} accessibilityRole="button" accessibilityLabel={`${ui('Comprar guía')} ${price(guide)}`}>{busy === guide.id ? <ActivityIndicator color={C.bg} /> : <Ionicons name="card-outline" size={20} color={C.bg} />}<Text style={s.buttonText}>{ui('COMPRAR GUÍA')} · {price(guide)}</Text></TouchableOpacity>}
              {guide.includedInMembership && <TouchableOpacity style={s.clubButton} onPress={() => router.push('/club-form')} accessibilityRole="button" accessibilityLabel={ui('Obtener con ITC Club')}><Ionicons name="sparkles-outline" size={19} color={C.gold} /><Text style={s.clubButtonText}>{ui('OBTENER CON ITC CLUB')}</Text></TouchableOpacity>}
            </>}
          </View>
        </View>;
      })}
      {!loading && filtered.length === 0 && !error && <Text style={s.empty}>{ui('No hay guías disponibles.')}</Text>}
    </ScrollView>
  </SafeAreaView>;
}

const C = { bg: '#050505', card: '#121212', gold: '#D4AF37', white: '#FFFFFF', secondary: '#A6A6A6', green: '#72D59B' };
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg }, content: { padding: 20, paddingBottom: 120 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, back: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  title: { color: C.white, fontSize: 28, fontWeight: '900' }, subtitle: { color: C.secondary, lineHeight: 22, marginTop: 8, marginBottom: 20 },
  search: { minHeight: 52, borderRadius: 16, backgroundColor: C.card, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 20 }, input: { flex: 1, color: C.white, fontSize: 15, marginLeft: 10 },
  card: { backgroundColor: C.card, borderRadius: 20, overflow: 'hidden', marginBottom: 20, borderWidth: 1, borderColor: '#242424' }, image: { width: '100%', aspectRatio: 16 / 9, backgroundColor: '#080808' }, placeholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#181818' }, body: { padding: 18 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, tag: { color: C.white, fontSize: 11, fontWeight: '800', backgroundColor: '#272727', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 99 }, premium: { color: C.bg, fontSize: 11, fontWeight: '900', backgroundColor: C.gold, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 99 }, owned: { color: '#07150D', fontSize: 11, fontWeight: '900', backgroundColor: C.green, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 99 },
  cardTitle: { color: C.white, fontSize: 21, fontWeight: '800', marginTop: 13 }, description: { color: C.secondary, lineHeight: 21, marginTop: 7 }, commerceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 12 }, meta: { color: C.gold, fontSize: 12, fontWeight: '700', flex: 1 }, price: { color: C.white, fontSize: 17, fontWeight: '900' },
  button: { minHeight: 52, borderRadius: 14, backgroundColor: C.gold, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 18, paddingHorizontal: 14 }, buttonText: { color: C.bg, fontWeight: '900', fontSize: 13 }, clubButton: { minHeight: 52, borderRadius: 14, borderWidth: 1, borderColor: C.gold, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 10, paddingHorizontal: 14 }, clubButtonText: { color: C.gold, fontWeight: '900', fontSize: 13 },
  error: { color: '#FFB4AB', marginBottom: 14 }, empty: { color: C.secondary, textAlign: 'center', marginTop: 40 }, loading: { minHeight: 180, alignItems: 'center', justifyContent: 'center' },
});
