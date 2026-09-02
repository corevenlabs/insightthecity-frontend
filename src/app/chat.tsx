import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
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

type Message = { id: string; from: 'user' | 'bot'; text: string; places?: Place[] };

export default function ChatScreen() {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const listRef = useRef<FlatList<Message>>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const loadHistory = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    try {
      const response = await fetch(`${API_URL}/api/chat`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (!response.ok || !data?.success) throw new Error(data?.message);
      const history: Message[] = (data.messages || []).map((item: any) => ({
        id: String(item.id), from: item.role === 'assistant' ? 'bot' : 'user', text: item.message,
      }));
      if (data.greeting) history.push({ id: 'greeting', from: 'bot', text: data.greeting });
      setMessages(history);
    } catch {
      setMessages([{ id: 'history-error', from: 'bot', text: t('chat.error') }]);
    } finally { setLoading(false); }
  }, [t, token]);

  useEffect(() => { void loadHistory(); }, [loadHistory]);
  useEffect(() => {
    if (messages.length) requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  }, [messages, sending]);

  const sendMessage = async (suggestion?: string) => {
    const userText = (suggestion ?? input).trim();
    if (!userText || !token || sending) return;
    const localId = `user-${Date.now()}`;
    setMessages((current) => [...current, { id: localId, from: 'user', text: userText }]);
    setInput('');
    setSending(true);
    try {
      let location: { lat: number; lng: number } | null = null;
      try { location = await getLocation(); } catch { location = null; }
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: userText, lat: location?.lat, lng: location?.lng }),
      });
      const data = await response.json();
      if (!response.ok || !data?.success) throw new Error(data?.message);
      setMessages((current) => [...current, {
        id: String(data.messageId || `bot-${Date.now()}`), from: 'bot', text: data.reply, places: data.places || [],
      }]);
    } catch {
      setMessages((current) => [...current, { id: `error-${Date.now()}`, from: 'bot', text: t('chat.error') }]);
    } finally { setSending(false); }
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
          <Ionicons name="map-outline" size={18} color={COLORS.gold} accessible={false} /><Text style={styles.actionText}>Maps</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Abrir en Waze" onPress={() => openWaze(place)} style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}>
          <Ionicons name="navigate-outline" size={18} color={COLORS.gold} accessible={false} /><Text style={styles.actionText}>Waze</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageGroup, item.from === 'user' && styles.userGroup]}>
      {item.from === 'bot' && <View style={styles.smallAvatar}><Ionicons name="sparkles" size={14} color={COLORS.black} accessible={false} /></View>}
      <View style={styles.messageContent}>
        <View style={[styles.message, item.from === 'user' ? styles.userMessage : styles.botMessage]}>
          <Text style={item.from === 'user' ? styles.userText : styles.botText}>{item.text}</Text>
        </View>
        {!!item.places?.length && <View style={styles.places}>{item.places.map(renderPlace)}</View>}
      </View>
    </View>
  );

  const suggestions = [t('chat.suggestionFood'), t('chat.suggestionToday'), t('chat.suggestionNearby')];

  if (authLoading || loading) return <SafeAreaView style={styles.center}><ActivityIndicator color={COLORS.gold} /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={8}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="Volver" hitSlop={8} onPress={() => router.back()} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
            <Ionicons name="arrow-back" size={24} color={COLORS.gold} />
          </Pressable>
          <View style={styles.identity}>
            <View style={styles.avatar}><Ionicons name="sparkles" size={21} color={COLORS.black} /><View style={styles.onlineDot} /></View>
            <View><Text style={styles.title}>City <Text style={styles.goldText}>Guide</Text></Text><Text style={styles.subtitle}>{t('chat.subtitle')}</Text></View>
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
              <View style={styles.typingRow}><View style={styles.smallAvatar}><Ionicons name="sparkles" size={14} color={COLORS.black} /></View><View style={styles.typingBubble}><ActivityIndicator size="small" color={COLORS.gold} /><Text style={styles.typingText}>{t('chat.typing')}</Text></View></View>
            ) : null} />
            {messages.length <= 1 && <View style={styles.suggestions}>{suggestions.map((suggestion) => (
              <Pressable key={suggestion} disabled={sending} onPress={() => void sendMessage(suggestion)} style={({ pressed }) => [styles.suggestionChip, pressed && styles.pressed]}>
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </Pressable>
            ))}</View>}
            <View style={styles.inputBar}>
              <TextInput value={input} onChangeText={setInput} onSubmitEditing={() => void sendMessage()} editable={!sending} maxLength={800} returnKeyType="send" placeholder={t('chat.placeholder')} placeholderTextColor="#858585" style={styles.input} accessibilityLabel={t('chat.placeholder')} />
              <Pressable accessibilityRole="button" accessibilityLabel={t('chat.send')} disabled={sending || !input.trim()} onPress={() => void sendMessage()} style={({ pressed }) => [styles.sendButton, (!input.trim() || sending) && styles.sendDisabled, pressed && styles.pressed]}>
                {sending ? <ActivityIndicator size="small" color={COLORS.black} /> : <Ionicons name="arrow-up" size={21} color={COLORS.black} />}
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
  header: { minHeight: 72, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: COLORS.border },
  iconButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }, identity: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.gold, alignItems: 'center', justifyContent: 'center' }, onlineDot: { position: 'absolute', right: -1, bottom: 1, width: 10, height: 10, borderRadius: 5, backgroundColor: '#5CCB7A', borderWidth: 2, borderColor: COLORS.background },
  title: { color: COLORS.text, fontSize: 18, fontWeight: '800' }, goldText: { color: COLORS.gold }, subtitle: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  chat: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 16, flexGrow: 1 }, messageGroup: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 16, maxWidth: '94%' }, userGroup: { alignSelf: 'flex-end' },
  smallAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.gold, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }, messageContent: { flexShrink: 1 }, message: { paddingHorizontal: 14, paddingVertical: 11, borderRadius: 18 }, userMessage: { backgroundColor: COLORS.gold, borderBottomRightRadius: 5 }, botMessage: { backgroundColor: COLORS.raised, borderBottomLeftRadius: 5, borderWidth: 1, borderColor: COLORS.border },
  userText: { color: COLORS.black, fontSize: 15, lineHeight: 21, fontWeight: '600' }, botText: { color: COLORS.text, fontSize: 15, lineHeight: 22 }, places: { marginTop: 10, gap: 10 },
  placeCard: { backgroundColor: COLORS.surface, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, padding: 14 }, placeTitleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 }, placeHeading: { flex: 1 }, placeTitle: { color: COLORS.text, fontSize: 16, lineHeight: 21, fontWeight: '700' }, placeType: { color: COLORS.goldSoft, fontSize: 12, marginTop: 2 },
  placeMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 }, rating: { color: COLORS.goldSoft, fontSize: 12, fontWeight: '700' }, openStatus: { color: COLORS.text, fontSize: 12 }, placeAddress: { color: COLORS.muted, fontSize: 13, lineHeight: 18, marginTop: 8 }, actionsRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  actionButton: { minHeight: 44, flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 12, borderWidth: 1, borderColor: COLORS.gold }, actionText: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  typingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }, typingBubble: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: COLORS.raised, borderRadius: 16, paddingHorizontal: 14 }, typingText: { color: COLORS.muted, fontSize: 13 },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, paddingBottom: 10 }, suggestionChip: { minHeight: 44, justifyContent: 'center', borderRadius: 22, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface, paddingHorizontal: 14 }, suggestionText: { color: COLORS.goldSoft, fontSize: 13, fontWeight: '600' },
  inputBar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingTop: 10, paddingBottom: Platform.OS === 'ios' ? 8 : 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: COLORS.border, backgroundColor: COLORS.background }, input: { flex: 1, minHeight: 48, maxHeight: 112, borderRadius: 24, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 17, color: COLORS.text, fontSize: 16 }, sendButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.gold, alignItems: 'center', justifyContent: 'center' }, sendDisabled: { opacity: 0.42 }, pressed: { opacity: 0.72 },
  guestState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }, guestIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.gold }, guestTitle: { color: COLORS.text, fontSize: 23, lineHeight: 30, fontWeight: '800', textAlign: 'center', marginTop: 24 }, guestSubtitle: { color: COLORS.muted, fontSize: 15, lineHeight: 23, textAlign: 'center', marginTop: 10 }, loginButton: { minHeight: 48, minWidth: 210, borderRadius: 24, backgroundColor: COLORS.gold, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, marginTop: 28 }, loginText: { color: COLORS.black, fontSize: 13, fontWeight: '900', letterSpacing: 1 },
});
