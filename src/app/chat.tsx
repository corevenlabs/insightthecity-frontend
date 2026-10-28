import { Text, TextInput } from '../components/typography';
import { ClubLogo } from '../components/ClubLogo';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL } from '../constants/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { grantAiConsent, type AiConsent } from '../lib/aiConsent';

const COLORS = {
  background: '#050505', surface: '#121212', raised: '#181818', border: '#292929',
  gold: '#FDDD56', goldSoft: '#F0D778', text: '#FFFFFF', muted: '#B8B8B8', black: '#080808',
};

type AppItem = { id: string | number; kind: 'experience' | 'news'; title: string; section?: string; source?: string; category?: string; region?: string; hasBenefit?: boolean; hasConditions?: boolean; memberBenefit?: string; memberBenefitDetails?: string; };
type Message = { id: string; from: 'user' | 'bot'; text: string; writing?: boolean; appItems?: AppItem[]; showMembership?: boolean };

function TypingDots({ label }: { label: string }) {
  const [dots] = useState(() => [new Animated.Value(0.3), new Animated.Value(0.3), new Animated.Value(0.3)]);
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
  const { user, token, loading: authLoading, refreshUser } = useAuth();
  const { t, ui } = useLanguage();
  const listRef = useRef<FlatList<Message>>(null);
  const sessionRef = useRef(0);
  const chatActiveRef = useRef(false);
  const openingRecommendationRef = useRef(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [visibleResults, setVisibleResults] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [writing, setWriting] = useState<{ id: string; text: string } | null>(null);
  // null: el backend no pide permiso (versión anterior). Si accepted es false, nada se envía.
  const [consent, setConsent] = useState<AiConsent | null>(null);
  const [consentBusy, setConsentBusy] = useState(false);
  const [consentError, setConsentError] = useState('');
  const [declined, setDeclined] = useState(false);
  const needsConsent = !!consent && !consent.accepted;

  const loadHistory = useCallback(async (session: number) => {
    if (!token) { setLoading(false); return; }
    try {
      const response = await fetch(`${API_URL}/api/chat`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (!response.ok || !data?.success) throw new Error(data?.message);
      // El historial del servidor es memoria, no conversación visible de esta apertura.
      if (sessionRef.current === session) {
        setMessages(typeof data.greeting === 'string' && data.greeting.trim() ? [{ id: `greeting-${session}`, from: 'bot', text: data.greeting.trim() }] : []);
        setVisibleResults({});
        setConsent(data.aiConsent ?? null);
      }
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
  const isWriting = Boolean(writing);
  useEffect(() => {
    if (messages.length) requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: !isWriting }));
  }, [messages, sending, isWriting]);

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
      if (sessionRef.current !== session) return;
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: userText }),
      });
      const data = await response.json();
      if (sessionRef.current !== session) return;
      if (response.status === 403 && data?.code === 'AI_CONSENT_REQUIRED') {
        // El mensaje no salió del servidor: se devuelve al campo y se pide el permiso.
        setMessages((current) => current.filter((message) => message.id !== localId));
        setInput(userText);
        setDeclined(false);
        setConsent(data.aiConsent ?? null);
        return;
      }
      if (!response.ok || !data?.success) throw new Error(data?.message);
      const replyId = String(data.messageId || `bot-${Date.now()}`);
      setWriting({ id: replyId, text: String(data.reply || '') });
      setMessages((current) => [...current, {
        id: replyId, from: 'bot', text: '', writing: true, appItems: data.appItems || [], showMembership: data.showMembership === true,
      }]);
    } catch {
      if (sessionRef.current !== session) return;
      setMessages((current) => [...current, { id: `error-${Date.now()}`, from: 'bot', text: t('chat.error') }]);
    } finally { if (sessionRef.current === session) setSending(false); }
  };

  const acceptConsent = async () => {
    if (!token || !consent || consentBusy) return;
    setConsentBusy(true); setConsentError('');
    try {
      setConsent(await grantAiConsent(token, consent.version));
      void refreshUser();
    } catch { setConsentError(ui('No se pudo guardar tu respuesta. Inténtalo de nuevo.')); }
    finally { setConsentBusy(false); }
  };

  const openPrivacy = () => {
    openingRecommendationRef.current = true;
    router.push({ pathname: '/legal', params: { slug: 'privacy' } });
  };

  const renderConsent = (notice: AiConsent['notice']) => declined ? (
    <View style={styles.guestState}>
      <View style={styles.guestIcon}><Ionicons name="shield-checkmark-outline" size={34} color={COLORS.gold} /></View>
      <Text style={styles.guestSubtitle}>{ui('Sin tu permiso, Yorki no envía nada. Puedes seguir usando el resto de la app.')}</Text>
      <Pressable accessibilityRole="button" onPress={() => setDeclined(false)} style={({ pressed }) => [styles.loginButton, pressed && styles.pressed]}>
        <Text style={styles.loginText}>{ui('Revisar aviso')}</Text>
      </Pressable>
    </View>
  ) : (
    <ScrollView contentContainerStyle={styles.consent}>
      <View style={styles.guestIcon}><Ionicons name="sparkles-outline" size={32} color={COLORS.gold} /></View>
      <Text style={styles.consentTitle} accessibilityRole="header">{notice.title}</Text>
      <Text style={styles.consentText}>{notice.intro}</Text>
      {notice.points.map((point) => (
        <View key={point} style={styles.consentPoint}>
          <Ionicons name="ellipse" size={7} color={COLORS.gold} style={styles.consentBullet} accessible={false} />
          <Text style={[styles.consentText, styles.flex]}>{point}</Text>
        </View>
      ))}
      <Text style={styles.consentText}>{notice.retention}</Text>
      <Text style={styles.consentText}>{notice.advice}</Text>
      <Text style={styles.consentMuted}>{notice.control}</Text>
      <Pressable accessibilityRole="link" onPress={openPrivacy} hitSlop={8}>
        <Text style={styles.consentLink}>{ui('Ver Política de Privacidad')}</Text>
      </Pressable>
      {!!consentError && <Text style={styles.consentError} accessibilityRole="alert">{consentError}</Text>}
      <Pressable accessibilityRole="button" accessibilityState={{ busy: consentBusy }} disabled={consentBusy} onPress={() => void acceptConsent()} style={({ pressed }) => [styles.loginButton, styles.consentButton, pressed && styles.pressed]}>
        {consentBusy ? <ActivityIndicator color={COLORS.black} /> : <Text style={styles.loginText}>{ui('Aceptar y continuar')}</Text>}
      </Pressable>
      <Pressable accessibilityRole="button" disabled={consentBusy} onPress={() => setDeclined(true)} style={({ pressed }) => [styles.declineButton, pressed && styles.pressed]}>
        <Text style={styles.declineText}>{ui('Ahora no')}</Text>
      </Pressable>
    </ScrollView>
  );

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageGroup, item.from === 'user' && styles.userGroup]}>
      <View style={styles.messageContent}>
        <View style={[styles.message, item.from === 'user' ? styles.userMessage : styles.botMessage]}>
          <Text style={item.from === 'user' ? styles.userText : styles.botText}>{item.text}</Text>
        </View>
        {!item.writing && !!item.appItems?.length && <View style={styles.places}>{item.appItems.slice(0, visibleResults[item.id] || 3).map((recommendation) => (
          <View key={`${recommendation.kind}:${recommendation.id}`} style={styles.placeCard}>
            <Text style={styles.resultSource}>{recommendation.kind === 'news' ? recommendation.section === 'ny-al-dia' ? ui('NY al día') : ui('Qué hacer en NY') : recommendation.hasBenefit ? 'ITC Club' : ui('En la app')}{recommendation.region ? ` · ${recommendation.region}` : ''}</Text>
            <Text style={styles.placeTitle}>{recommendation.title}</Text>
            {recommendation.hasBenefit && !!recommendation.memberBenefit && <Text style={styles.resultBenefit}>{recommendation.memberBenefit}</Text>}
            {recommendation.hasBenefit && !recommendation.memberBenefit && <Text style={styles.resultBenefit}>{ui('Beneficio para miembros ITC Club')}</Text>}
            {recommendation.hasConditions && <Text style={styles.resultConditions}>{ui('Aplican condiciones')}</Text>}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={ui('Abrir {title}', { title: recommendation.title })}
              onPress={() => {
                openingRecommendationRef.current = true;
                router.push(recommendation.kind === 'experience'
                ? { pathname: '/experience-detail', params: { id: String(recommendation.id) } }
                : { pathname: '/news-detail', params: { id: String(recommendation.id), section: recommendation.section } });
              }}
              style={({ pressed }) => [styles.actionButton, { marginTop: 10, alignSelf: 'flex-start' }, pressed && styles.pressed]}
            >
              <Text style={styles.actionText}>{ui(recommendation.kind === 'experience' ? 'Ver detalle' : 'Ver publicación')}</Text>
              <Ionicons name="arrow-forward" size={16} color={COLORS.black} accessible={false} />
            </Pressable>
          </View>
        ))}
          {item.appItems.length > (visibleResults[item.id] || 3) && <Pressable accessibilityRole="button" onPress={() => setVisibleResults(current => ({ ...current, [item.id]: (current[item.id] || 3) + 6 }))} style={({ pressed }) => [styles.moreResults, pressed && styles.pressed]}>
            <Text style={styles.moreResultsText}>{ui('Ver más resultados')} ({item.appItems.length - (visibleResults[item.id] || 3)})</Text>
          </Pressable>}
        </View>}
        {!item.writing && item.showMembership && !user?.is_premium && <Pressable accessibilityRole="button" onPress={() => { openingRecommendationRef.current = true; router.push('/(tabs)/club'); }} style={({ pressed }) => [styles.membershipAction, pressed && styles.pressed]}>
          <Ionicons name="star-outline" size={17} color={COLORS.gold} accessible={false} />
          <Text style={styles.membershipActionText}>{ui('Conocer la membresía')}</Text>
          <Ionicons name="arrow-forward" size={16} color={COLORS.gold} accessible={false} />
        </Pressable>}
      </View>
    </View>
  );


  if (authLoading || loading) return <SafeAreaView style={styles.center}><ActivityIndicator color={COLORS.gold} /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={8}>
        <View style={styles.header}>
          <View style={styles.headerSide}>
            <Pressable accessibilityRole="button" accessibilityLabel={ui("Volver")} hitSlop={8} onPress={() => router.back()} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
              <Ionicons name="arrow-back" size={24} color="#FDDD56" />
            </Pressable>
            <ClubLogo width={44} />
          </View>
          <View style={styles.identity}>
            <Text style={styles.assistantName} accessibilityRole="header">YORK<Text style={styles.brandI}>i</Text></Text>
            <Text style={styles.subtitle}>{t('chat.subtitle')}</Text>
          </View>
          <View style={styles.headerSide} />
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
        ) : needsConsent ? renderConsent(consent.notice) : (
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
  resultSource: { color: COLORS.muted, fontSize: 11, lineHeight: 16, marginBottom: 5 },
  resultBenefit: { color: COLORS.gold, fontSize: 15, fontWeight: '700', lineHeight: 21, marginTop: 8 },
  resultConditions: { color: COLORS.text, fontSize: 13, lineHeight: 19, marginTop: 5 },
  moreResults: { minHeight: 44, alignItems: 'center', justifyContent: 'center', padding: 12, borderWidth: 1, borderColor: COLORS.border, borderRadius: 14 },
  moreResultsText: { color: COLORS.gold, fontSize: 14, fontWeight: '700' },
  membershipAction: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, padding: 14, marginTop: 10, borderWidth: 1, borderColor: COLORS.gold, borderRadius: 16, backgroundColor: COLORS.surface },
  membershipActionText: { color: COLORS.gold, fontSize: 14, fontWeight: '700', flexShrink: 1 },

  flex: { flex: 1 }, container: { flex: 1, backgroundColor: COLORS.background }, center: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
  header: { width: '100%', maxWidth: 780, alignSelf: 'center', minHeight: 88, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: COLORS.border },
  iconButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }, identity: { flex: 1, minWidth: 0, alignItems: 'center', justifyContent: 'center', paddingVertical: 10 },
  headerSide: { width: 92, flexDirection: 'row', alignItems: 'center', flexShrink: 0 },
  assistantName: { color: COLORS.text, fontSize: 29, lineHeight: 35, fontWeight: '800', letterSpacing: 1 },
  brandI: { color: COLORS.black, backgroundColor: COLORS.gold },
  subtitle: { color: COLORS.muted, fontSize: 11, lineHeight: 15, marginTop: 2, textAlign: 'center' },
  chat: { width: '100%', maxWidth: 780, alignSelf: 'center', paddingHorizontal: 16, paddingTop: 20, paddingBottom: 16, flexGrow: 1 }, messageGroup: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 16, maxWidth: '94%' }, userGroup: { alignSelf: 'flex-end' },
  messageContent: { flexShrink: 1 }, message: { paddingHorizontal: 14, paddingVertical: 11, borderRadius: 18 }, userMessage: { backgroundColor: COLORS.gold, borderBottomRightRadius: 5 }, botMessage: { backgroundColor: COLORS.surface, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 18 },
  userText: { color: COLORS.black, fontSize: 15, lineHeight: 21, fontWeight: '600' }, botText: { color: COLORS.text, fontSize: 15, lineHeight: 22 }, places: { marginTop: 10, gap: 10 },
  placeCard: { backgroundColor: COLORS.surface, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, padding: 14 }, placeTitleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 }, placeHeading: { flex: 1 }, placeTitle: { color: COLORS.text, fontSize: 16, lineHeight: 21, fontWeight: '700' }, placeType: { color: COLORS.goldSoft, fontSize: 12, marginTop: 2 },
  placeMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 }, rating: { color: COLORS.goldSoft, fontSize: 12, fontWeight: '700' }, openStatus: { color: COLORS.text, fontSize: 12 }, placeAddress: { color: COLORS.muted, fontSize: 13, lineHeight: 18, marginTop: 8 }, actionsRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  actionButton: { minHeight: 44, flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 12, backgroundColor: COLORS.gold, paddingHorizontal: 14 }, actionText: { color: COLORS.black, fontSize: 13, fontWeight: '700' },
  typingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }, typingBubble: { minHeight: 32, flexDirection: 'row', alignItems: 'center' }, typingDots: { flexDirection: 'row', alignItems: 'center', gap: 5 }, typingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.muted },
  inputBar: { width: '100%', maxWidth: 780, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingTop: 10, paddingBottom: Platform.OS === 'ios' ? 8 : 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: COLORS.border, backgroundColor: COLORS.background }, input: { flex: 1, minHeight: 48, maxHeight: 112, borderRadius: 24, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 17, color: COLORS.text, fontSize: 16 }, sendButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.gold, alignItems: 'center', justifyContent: 'center' }, sendDisabled: { opacity: 0.42 }, pressed: { opacity: 0.72 },
  consent: { width: '100%', maxWidth: 620, alignSelf: 'center', alignItems: 'stretch', paddingHorizontal: 24, paddingTop: 28, paddingBottom: 40, gap: 12 },
  consentTitle: { color: COLORS.text, fontSize: 22, lineHeight: 29, fontWeight: '800', marginTop: 8 },
  consentText: { color: COLORS.text, fontSize: 15, lineHeight: 22 }, consentMuted: { color: COLORS.muted, fontSize: 14, lineHeight: 21 },
  consentPoint: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingLeft: 4 }, consentBullet: { marginTop: 8 },
  consentLink: { color: COLORS.gold, fontSize: 15, fontWeight: '700', textDecorationLine: 'underline', paddingVertical: 6 },
  consentError: { color: '#FF8080', fontSize: 14, lineHeight: 20 }, consentButton: { alignSelf: 'stretch', marginTop: 8 },
  declineButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center' }, declineText: { color: COLORS.muted, fontSize: 14, fontWeight: '700' },
  guestState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }, guestIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.gold }, guestTitle: { color: COLORS.text, fontSize: 23, lineHeight: 30, fontWeight: '800', textAlign: 'center', marginTop: 24 }, guestSubtitle: { color: COLORS.muted, fontSize: 15, lineHeight: 23, textAlign: 'center', marginTop: 10 }, loginButton: { minHeight: 48, minWidth: 210, borderRadius: 24, backgroundColor: COLORS.gold, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, marginTop: 28 }, loginText: { color: COLORS.black, fontSize: 13, fontWeight: '900', letterSpacing: 1 },
});
