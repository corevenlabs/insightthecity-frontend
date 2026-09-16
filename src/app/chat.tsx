import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getLocation } from '../../services/location';
import { API_URL } from '../constants/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const COLORS = {
  background: '#050505', surface: '#121212', raised: '#181818', border: '#292929',
  gold: '#D4AF37', goldSoft: '#F0D778', text: '#FFFFFF', muted: '#B8B8B8', black: '#080808',
};

type Place = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  rating?: number;
  userRatingCount?: number;
  primaryTypeDisplayName?: { text?: string };
  googleMapsUri?: string;
  currentOpeningHours?: { openNow?: boolean };
};

type AppItem = { id: string | number; kind: 'experience' | 'news'; title: string; section?: string };

type Message = { id: string; from: 'user' | 'bot'; text: string; writing?: boolean; places?: Place[]; appItems?: AppItem[] };

function TypingDots({ label }: { label: string }) {
  const dots = useRef([new Animated.Value(0.3), new Animated.Value(0.3), new Animated.Value(0.3)]).current;
  useEffect(() => {
    const animation = Animated.loop(Animated.stagger(140, dots.map((opacity) => Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0.3, duration: 300, useNativeDriver: true }),
    ]))));
    animation.start();
    return () => animation.stop();
  }, [dots]);
  return (
    <View style={styles.typingDots} accessible accessibilityLabel={label}>
      {dots.map((opacity, index) => <Animated.View key={index} style={[styles.typingDot, { opacity }]} />)}
    </View>
  );
}

export default function ChatScreen() {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const listRef = useRef<FlatList<Message>>(null);
  const sessionRef = useRef(0);
  const chatActiveRef = useRef(false);
  const openingRecommendationRef = useRef(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [writing, setWriting] = useState<{ id: string; text: string } | null>(null);

  const loadHistory = useCallback(async (session: number) => {
    if (!token) { setLoading(false); return; }
    try {
      const response = await fetch(`${API_URL}/api/chat`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (!response.ok || !data?.success) throw new Error(data?.message);
      // El historial del servidor es memoria, no conversación visible de esta apertura.
      if (sessionRef.current === session) setMessages([]);
    } catch {
      if (sessionRef.current === session) setMessages([{ id: 'history-error', from: 'bot', text: t('chat.error') }]);
    } finally { if (sessionRef.current === session) setLoading(false); }
  }, [t, token]);

  useFocusEffect(useCallback(() => {
    if (!chatActiveRef.current) {
      chatActiveRef.current = true;
      const session = ++sessionRef.current;
      setMessages([]);
      setInput('');
      setWriting(null);
      setSending(false);
      setLoading(true);
      void loadHistory(session);
    }
    return () => {
      // Abrir un detalle es parte de la conversación, no el cierre del chat.
      if (openingRecommendationRef.current) {
        openingRecommendationRef.current = false;
        return;
      }
      chatActiveRef.current = false;
      sessionRef.current += 1;
      setMessages([]);
      setInput('');
      setWriting(null);
      setSending(false);
    };
  }, [loadHistory]));
  useEffect(() => {
    if (messages.length) requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: !writing }));
  }, [messages, sending]);

  useEffect(() => {
    if (!writing) return;
    const characters = Array.from(writing.text);
    const started = Date.now();
    const duration = Math.min(8000, Math.max(400, characters.length * 18));
    const timer = setInterval(() => {
      const count = Math.min(characters.length, Math.ceil(characters.length * (Date.now() - started) / duration));
      const done = count >= characters.length;
      setMessages((current) => current.map((message) => message.id === writing.id
        ? { ...message, text: characters.slice(0, count).join(''), writing: !done }
        : message));
      if (done) {
        clearInterval(timer);
        setWriting(null);
      }
    }, 32);
    return () => clearInterval(timer);
  }, [writing]);

  const sendMessage = async (suggestion?: string) => {
    const userText = (suggestion ?? input).trim();
    if (!userText || !token || sending || writing) return;
    const session = sessionRef.current;
    const localId = `user-${Date.now()}`;
    setMessages((current) => [...current, { id: localId, from: 'user', text: userText }]);
    setInput('');
    setSending(true);
    try {
      let location: { lat: number; lng: number } | null = null;
      if (/cerca|nearby|near me|perto/i.test(userText)) {
        try { location = await getLocation(); } catch { location = null; }
      }
      if (sessionRef.current !== session) return;
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: userText, lat: location?.lat, lng: location?.lng }),
      });
      const data = await response.json();
      if (!response.ok || !data?.success) throw new Error(data?.message);
      if (sessionRef.current !== session) return;
      const replyId = String(data.messageId || `bot-${Date.now()}`);
      setWriting({ id: replyId, text: String(data.reply || '') });
      setMessages((current) => [...current, {
        id: replyId, from: 'bot', text: '', writing: true, places: data.places || [], appItems: data.appItems || [],
      }]);
    } catch {
      if (sessionRef.current !== session) return;
      setMessages((current) => [...current, { id: `error-${Date.now()}`, from: 'bot', text: t('chat.error') }]);
    } finally { if (sessionRef.current === session) setSending(false); }
  };

  const openMaps = (place: Place) => {
    const lat = place.location?.latitude;
    const lng = place.location?.longitude;
    const url = place.googleMapsUri || (lat != null && lng != null
      ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}` : undefined);
    if (url) void Linking.openURL(url);
  };

  const openWaze = (place: Place) => {
    const lat = place.location?.latitude;
    const lng = place.location?.longitude;
    if (lat != null && lng != null) void Linking.openURL(`https://waze.com/ul?ll=${lat},${lng}&navigate=yes`);
  };

  const renderPlace = (place: Place, index: number) => (
    <View key={place.id || `${place.displayName?.text}-${index}`} style={styles.placeCard}>
      <View style={styles.placeTitleRow}>
        <Ionicons name="location-outline" size={20} color={COLORS.gold} accessible={false} />
        <View style={styles.placeHeading}>
          <Text style={styles.placeTitle}>{place.displayName?.text}</Text>
          {!!place.primaryTypeDisplayName?.text && <Text style={styles.placeType}>{place.primaryTypeDisplayName.text}</Text>}
        </View>
      </View>
      <View style={styles.placeMeta}>
        {place.rating != null && <Text style={styles.rating}>★ {place.rating.toFixed(1)}{place.userRatingCount ? ` (${place.userRatingCount})` : ''}</Text>}
        {place.currentOpeningHours?.openNow != null && (
          <Text style={styles.openStatus}>{place.currentOpeningHours.openNow ? t('chat.open') : t('chat.closed')}</Text>
        )}
      </View>
      {!!place.formattedAddress && <Text style={styles.placeAddress}>{place.formattedAddress}</Text>}
      <View style={styles.actionsRow}>
        <Pressable accessibilityRole="button" accessibilityLabel="Abrir en Google Maps" onPress={() => openMaps(place)} style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}>
          <Ionicons name="map-outline" size={18} color={COLORS.black} accessible={false} /><Text style={styles.actionText}>Maps</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Abrir en Waze" onPress={() => openWaze(place)} style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}>
          <Ionicons name="navigate-outline" size={18} color={COLORS.black} accessible={false} /><Text style={styles.actionText}>Waze</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageGroup, item.from === 'user' && styles.userGroup]}>
      <View style={styles.messageContent}>
        <View style={[styles.message, item.from === 'user' ? styles.userMessage : styles.botMessage]}>
          <Text style={item.from === 'user' ? styles.userText : styles.botText}>{item.text}</Text>
        </View>
        {!item.writing && !!item.appItems?.length && <View style={styles.places}>{item.appItems.slice(0, 3).map((recommendation) => (
          <View key={`${recommendation.kind}:${recommendation.id}`} style={styles.placeCard}>
            <Text style={styles.placeTitle}>{recommendation.title}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Abrir ${recommendation.title}`}
              onPress={() => {
                openingRecommendationRef.current = true;
                router.push(recommendation.kind === 'experience'
                ? { pathname: '/experience-detail', params: { id: String(recommendation.id) } }
                : { pathname: '/news-detail', params: { id: String(recommendation.id), section: recommendation.section } });
              }}
              style={({ pressed }) => [styles.actionButton, { marginTop: 10, alignSelf: 'flex-start' }, pressed && styles.pressed]}
            >
              <Text style={styles.actionText}>{recommendation.kind === 'experience' ? 'Ver evento' : 'Ver guía'}</Text>
              <Ionicons name="arrow-forward" size={16} color={COLORS.black} accessible={false} />
            </Pressable>
          </View>
        ))}</View>}
        {!item.writing && !!item.places?.length && <View style={styles.places}>{item.places.map(renderPlace)}</View>}
      </View>
    </View>
  );


  if (authLoading || loading) return <SafeAreaView style={styles.center}><ActivityIndicator color={COLORS.gold} /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={8}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="Volver" hitSlop={8} onPress={() => router.back()} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
            <Ionicons name="arrow-back" size={24} color="#D4AF37" />
          </Pressable>
          <View style={styles.identity}>
            <Text style={styles.assistantName}>YORK<Text style={styles.brandI}>i</Text></Text>
            <Text style={styles.subtitle}>{t('chat.subtitle')}</Text>
          </View>
          <View style={styles.iconButton} />
        </View>

        {!token || !user ? (
          <View style={styles.guestState}>
            <View style={styles.guestIcon}><Ionicons name="chatbubble-ellipses-outline" size={34} color={COLORS.gold} /></View>
            <Text style={styles.guestTitle}>{t('chat.guestTitle')}</Text>
            <Text style={styles.guestSubtitle}>{t('chat.guestSubtitle')}</Text>
            <Pressable accessibilityRole="button" onPress={() => router.push('/login' as any)} style={({ pressed }) => [styles.loginButton, pressed && styles.pressed]}>
              <Text style={styles.loginText}>{t('chat.signIn')}</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <FlatList ref={listRef} data={messages} renderItem={renderMessage} keyExtractor={(item) => item.id} contentContainerStyle={styles.chat} keyboardShouldPersistTaps="handled" ListFooterComponent={sending ? (
              <View style={styles.typingRow}><View style={styles.typingBubble}><TypingDots label={t('chat.typing')} /></View></View>
            ) : null} />
            <View style={styles.inputBar}>
              <TextInput value={input} onChangeText={setInput} onSubmitEditing={() => void sendMessage()} editable={!sending && !writing} maxLength={800} returnKeyType="send" placeholder={t('chat.placeholder')} placeholderTextColor="#858585" style={styles.input} accessibilityLabel={t('chat.placeholder')} />
              <Pressable accessibilityRole="button" accessibilityLabel={t('chat.send')} disabled={sending || Boolean(writing) || !input.trim()} onPress={() => void sendMessage()} style={({ pressed }) => [styles.sendButton, (!input.trim() || sending || writing) && styles.sendDisabled, pressed && styles.pressed]}>
                <Ionicons name="arrow-up" size={21} color={COLORS.black} />
              </Pressable>
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 }, container: { flex: 1, backgroundColor: COLORS.background }, center: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
  header: { minHeight: 88, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: COLORS.border },
  iconButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }, identity: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  assistantName: { color: COLORS.text, fontSize: 29, lineHeight: 35, fontWeight: '800', letterSpacing: 1 },
  brandI: { color: COLORS.black, backgroundColor: COLORS.gold },
  subtitle: { color: COLORS.muted, fontSize: 11, lineHeight: 15, marginTop: 2, textAlign: 'center' },
  chat: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 16, flexGrow: 1 }, messageGroup: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 16, maxWidth: '94%' }, userGroup: { alignSelf: 'flex-end' },
  messageContent: { flexShrink: 1 }, message: { paddingHorizontal: 14, paddingVertical: 11, borderRadius: 18 }, userMessage: { backgroundColor: COLORS.gold, borderBottomRightRadius: 5 }, botMessage: { backgroundColor: COLORS.surface, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 18 },
  userText: { color: COLORS.black, fontSize: 15, lineHeight: 21, fontWeight: '600' }, botText: { color: COLORS.text, fontSize: 15, lineHeight: 22 }, places: { marginTop: 10, gap: 10 },
  placeCard: { backgroundColor: COLORS.surface, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, padding: 14 }, placeTitleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 }, placeHeading: { flex: 1 }, placeTitle: { color: COLORS.text, fontSize: 16, lineHeight: 21, fontWeight: '700' }, placeType: { color: COLORS.goldSoft, fontSize: 12, marginTop: 2 },
  placeMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 }, rating: { color: COLORS.goldSoft, fontSize: 12, fontWeight: '700' }, openStatus: { color: COLORS.text, fontSize: 12 }, placeAddress: { color: COLORS.muted, fontSize: 13, lineHeight: 18, marginTop: 8 }, actionsRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  actionButton: { minHeight: 44, flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 12, backgroundColor: COLORS.gold, paddingHorizontal: 14 }, actionText: { color: COLORS.black, fontSize: 13, fontWeight: '700' },
  typingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }, typingBubble: { minHeight: 32, flexDirection: 'row', alignItems: 'center' }, typingDots: { flexDirection: 'row', alignItems: 'center', gap: 5 }, typingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.muted },
  inputBar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingTop: 10, paddingBottom: Platform.OS === 'ios' ? 8 : 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: COLORS.border, backgroundColor: COLORS.background }, input: { flex: 1, minHeight: 48, maxHeight: 112, borderRadius: 24, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 17, color: COLORS.text, fontSize: 16 }, sendButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.gold, alignItems: 'center', justifyContent: 'center' }, sendDisabled: { opacity: 0.42 }, pressed: { opacity: 0.72 },
  guestState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }, guestIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.gold }, guestTitle: { color: COLORS.text, fontSize: 23, lineHeight: 30, fontWeight: '800', textAlign: 'center', marginTop: 24 }, guestSubtitle: { color: COLORS.muted, fontSize: 15, lineHeight: 23, textAlign: 'center', marginTop: 10 }, loginButton: { minHeight: 48, minWidth: 210, borderRadius: 24, backgroundColor: COLORS.gold, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, marginTop: 28 }, loginText: { color: COLORS.black, fontSize: 13, fontWeight: '900', letterSpacing: 1 },
});
