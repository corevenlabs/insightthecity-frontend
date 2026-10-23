import { Text } from '../components/typography';
import { SavedProvider } from '../context/SavedContext';
import { Ionicons } from '@expo/vector-icons';
import { Stack, usePathname, useRouter, useSegments, type ErrorBoundaryProps } from 'expo-router';
import * as Updates from 'expo-updates';
import { useEffect, useState } from 'react';
import { Animated, Easing, Platform, Pressable, StyleSheet, Text as NativeText, useWindowDimensions, View } from 'react-native';

import { useFonts } from 'expo-font';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Roboto_400Regular, Roboto_500Medium, Roboto_600SemiBold, Roboto_700Bold, Roboto_800ExtraBold, Roboto_900Black, Roboto_400Regular_Italic, Roboto_700Bold_Italic } from '@expo-google-fonts/roboto';
import { RobotoCondensed_900Black } from '@expo-google-fonts/roboto-condensed';

import { AuthProvider, useAuth } from '../context/AuthContext';
import { LanguageProvider, useLanguage } from '../context/LanguageContext';
import { BiometricLockScreen } from '../components/BiometricLockScreen';

function ChatLauncher({ visible, animate }: { visible: boolean; animate: boolean }) {
  const router = useRouter();
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const { fontScale } = useWindowDimensions();
  // Match the tab bar height in (tabs)/_layout, then leave room for the bubble tail.
  // iOS and screens outside the tab navigator retain their existing placement.
  const androidTabOffset = Platform.OS === 'android' && segments[0] === '(tabs)'
    ? { bottom: 60 + Math.max(insets.bottom, 10) + Math.max(0, fontScale - 1) * 16 + 16 }
    : undefined;
  const { language } = useLanguage();
  const { user } = useAuth();
  const pathname = usePathname();
  const [inviteMessage, setInviteMessage] = useState<'intro' | 'help' | null>(null);
  const [typedCount, setTypedCount] = useState(0);
  const [bubbleProgress] = useState(() => new Animated.Value(0));
  const buttonLabel = language === 'en' ? 'Open chat with Yorki' : language === 'pt' ? 'Abrir chat com Yorki' : 'Abrir chat con Yorki';
  const introduction = language === 'en' ? "Hi, I'm" : language === 'pt' ? 'Olá, sou' : 'Hola, soy';
  const helpQuestion = language === 'en' ? 'What would you like to do today?' : language === 'pt' ? 'O que você gostaria de fazer hoje?' : '¿Qué te gustaría hacer hoy?';

  useEffect(() => {
    if (!visible || !animate) {
      bubbleProgress.stopAnimation();
      bubbleProgress.setValue(0);
      return;
    }
    const openBubble = () => Animated.sequence([
      Animated.timing(bubbleProgress, { toValue: 0.7, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      Animated.timing(bubbleProgress, { toValue: 1.08, duration: 190, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      Animated.timing(bubbleProgress, { toValue: 0.96, duration: 120, useNativeDriver: false }),
      Animated.timing(bubbleProgress, { toValue: 1, duration: 100, useNativeDriver: false }),
    ]).start();
    const closeBubble = () => Animated.sequence([
      Animated.timing(bubbleProgress, { toValue: 1.04, duration: 100, useNativeDriver: false }),
      Animated.timing(bubbleProgress, { toValue: 0.38, duration: 180, easing: Easing.in(Easing.cubic), useNativeDriver: false }),
      Animated.timing(bubbleProgress, { toValue: 0, duration: 200, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
    ]).start();
    const timers: ReturnType<typeof setTimeout>[] = [];
    let typingTimer: ReturnType<typeof setInterval> | null = null;
    const startTyping = (length: number) => {
      if (typingTimer) clearInterval(typingTimer);
      setTypedCount(0);
      let count = 0;
      typingTimer = setInterval(() => {
        count += 1;
        setTypedCount(count);
        if (count >= length && typingTimer) {
          clearInterval(typingTimer);
          typingTimer = null;
        }
      }, 55);
    };
    timers.push(
      setTimeout(() => { setTypedCount(0); setInviteMessage('intro'); }, 0),
      setTimeout(openBubble, 250),
      setTimeout(() => startTyping(`${introduction} YORKi`.length), 950),
      setTimeout(closeBubble, 2450),
      setTimeout(() => { setTypedCount(0); setInviteMessage('help'); }, 3000),
      setTimeout(openBubble, 3250),
      setTimeout(() => startTyping(helpQuestion.length), 3950),
      setTimeout(closeBubble, 6100),
      setTimeout(() => setInviteMessage(null), 6650),
    );
    return () => {
      timers.forEach(clearTimeout);
      if (typingTimer) clearInterval(typingTimer);
      bubbleProgress.stopAnimation();
      bubbleProgress.setValue(0);
      setInviteMessage(null);
      setTypedCount(0);
    };
  }, [visible, animate, bubbleProgress, introduction, helpQuestion]);

  if (!visible || (pathname === '/club' && !user?.is_premium)) return null;
  const openChat = () => router.push('/chat');
  const introPrefix = `${introduction} `;
  const introPrefixCount = Math.min(typedCount, introPrefix.length);
  const yorkCount = Math.min(Math.max(typedCount - introPrefix.length, 0), 4);
  return <View style={[styles.chatLauncher, androidTabOffset]} pointerEvents="box-none">
    <Animated.View style={[styles.morphingChatButton, {
      width: bubbleProgress.interpolate({ inputRange: [0, 0.3, 0.7, 1, 1.08], outputRange: [58, 76, 174, 220, 226], extrapolate: 'clamp' }),
      height: bubbleProgress.interpolate({ inputRange: [0, 0.3, 0.7, 1, 1.08], outputRange: [58, 52, 60, 68, 64], extrapolate: 'clamp' }),
      borderRadius: bubbleProgress.interpolate({ inputRange: [0, 0.3, 0.7, 1, 1.08], outputRange: [29, 26, 30, 34, 32], extrapolate: 'clamp' }),
    }]}>
      <Pressable accessibilityRole="button" accessibilityLabel={inviteMessage ? inviteMessage === 'intro' ? `${introduction} YORKi` : helpQuestion : buttonLabel} onPress={openChat} style={styles.morphingChatTap}>
        <Animated.View style={[styles.chatIcon, { opacity: bubbleProgress.interpolate({ inputRange: [0, 0.35, 1], outputRange: [1, 0, 0], extrapolate: 'clamp' }) }]}><Ionicons name="chatbubble-ellipses" size={24} color="#000" /></Animated.View>
        {inviteMessage && <Animated.View style={{ opacity: bubbleProgress.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 0, 1], extrapolate: 'clamp' }) }}>
          {inviteMessage === 'intro'
            ? <Text style={styles.yorkiLine} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
                {introPrefix.slice(0, introPrefixCount)}<Text style={styles.hiddenLetter}>{introPrefix.slice(introPrefixCount)}</Text><Text style={styles.yorkWhite}>{'YORK'.slice(0, yorkCount)}</Text><Text style={styles.hiddenLetter}>{'YORK'.slice(yorkCount)}</Text><Text style={typedCount > introPrefix.length + 4 ? styles.iBlack : styles.hiddenLetter}>i</Text>
              </Text>
            : <Text style={styles.helpQuestion}>{helpQuestion.slice(0, typedCount)}<Text style={styles.hiddenLetter}>{helpQuestion.slice(typedCount)}</Text></Text>}
        </Animated.View>}
      </Pressable>
      <Animated.View pointerEvents="none" style={[styles.speechTail, { opacity: bubbleProgress.interpolate({ inputRange: [0, 0.75, 1], outputRange: [0, 0, 1], extrapolate: 'clamp' }) }]} />
    </Animated.View>
  </View>;
}

// Un error al renderizar no debe cerrar la app: se muestra esta pantalla y se puede
// reintentar. Va fuera de los providers, así que no usa contexto ni fuentes propias.
export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return (
    <View style={errorStyles.container} accessibilityRole="alert">
      <NativeText style={errorStyles.title}>Algo salió mal</NativeText>
      <NativeText style={errorStyles.body}>Something went wrong · Algo deu errado</NativeText>
      <Pressable accessibilityRole="button" accessibilityLabel="Reintentar" onPress={() => void retry()} style={({ pressed }) => [errorStyles.button, pressed && { opacity: 0.72 }]}>
        <NativeText style={errorStyles.buttonText}>REINTENTAR · RETRY</NativeText>
      </Pressable>
    </View>
  );
}

const errorStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505', alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  title: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', textAlign: 'center' },
  body: { color: '#B8B8B8', fontSize: 15, textAlign: 'center' },
  button: { marginTop: 16, minHeight: 48, minWidth: 200, borderRadius: 24, backgroundColor: '#FDDD56', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  buttonText: { color: '#080808', fontSize: 13, fontWeight: '900', letterSpacing: 1 },
});

export default function RootLayout() {
  const pathname = usePathname();

  const [fontsLoaded, fontError] = useFonts({
    Roboto_400Regular, Roboto_500Medium, Roboto_600SemiBold, Roboto_700Bold,
    Roboto_800ExtraBold, Roboto_900Black, Roboto_400Regular_Italic, Roboto_700Bold_Italic,
    RobotoCondensed_900Black,
  });

  useEffect(() => {
    if (__DEV__ || !Updates.isEnabled) return;
    void Updates.checkForUpdateAsync()
      .then(async (update) => {
        if (!update.isAvailable) return;
        await Updates.fetchUpdateAsync();
        // Apply the downloaded update on the next cold start. Reloading here can
        // tear down Hermes while startup requests still retain native promises.
      })
      .catch(() => {
        // Una falla de actualización nunca debe impedir el acceso a la app instalada.
      });
  }, []);

  if (!fontsLoaded && !fontError) return null;

  const hideChatButton = [
    '/welcome',
    '/login',
    '/forgot-password',
    '/register',
    '/choose-access',
    '/chat',
    '/checkout-return',
    '/success',
    '/legal',
    '/delete-account',
  ].includes(pathname);

  return (
    <AuthProvider>
      <LanguageProvider><SavedProvider>
      <View style={{ flex: 1, backgroundColor: '#050505', alignItems: 'center' }}>
      <View style={{ flex: 1, width: '100%', maxWidth: 1100 }}>
        <Stack
          initialRouteName="index"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="welcome" />
          <Stack.Screen name="login" />
          <Stack.Screen name="forgot-password" />
          <Stack.Screen name="register" />
          <Stack.Screen name="choose-access" options={{ gestureEnabled: false }} />
          <Stack.Screen
            name="(tabs)"
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen name="club-form" />
          <Stack.Screen name="chat" />
          <Stack.Screen name="checkout-return" />
          <Stack.Screen name="success" />
          <Stack.Screen name="legal" />
          <Stack.Screen name="delete-account" />
          <Stack.Screen name="guides" />
          <Stack.Screen name="que-hacer" />
          <Stack.Screen name="ny-al-dia" />
          <Stack.Screen name="news-detail" />
          <Stack.Screen name="experience-detail" />
        </Stack>

        <ChatLauncher visible={!hideChatButton} animate={pathname === '/home'} />
        <BiometricLockScreen />
      </View></View>
      </SavedProvider></LanguageProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  chatLauncher: { position: 'absolute', bottom: 85, right: 20, width: 220, height: 68, zIndex: 999 },
  morphingChatButton: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#FDDD56', elevation: 6 },
  morphingChatTap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  speechTail: { position: 'absolute', bottom: -5, right: 23, width: 12, height: 12, backgroundColor: '#FDDD56', transform: [{ rotate: '45deg' }] },
  yorkiLine: { color: '#0A0A0A', fontSize: 19, lineHeight: 25, fontWeight: '800' },
  yorkWhite: { color: '#FFF', textShadowColor: 'rgba(0,0,0,0.45)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
  iBlack: { color: '#0A0A0A' },
  hiddenLetter: { color: 'transparent' },
  helpQuestion: { color: '#0A0A0A', fontSize: 16, lineHeight: 21, fontWeight: '800', textAlign: 'center' },
  chatIcon: { position: 'absolute', right: 17, bottom: 17 },
});
