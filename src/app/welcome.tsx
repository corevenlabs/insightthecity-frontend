import { Text } from '../components/typography';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { requireOptionalNativeModule } from 'expo';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const GOLD = '#FDDD56';
const BLACK = '#050505';

// Returning from login must not replay the intro in the same session.
let introShown = false;

// expo-video es nativo: una OTA puede llegar a un build que no lo incluye. Importarlo
// sin comprobar lanzaría al cargar las rutas y cerraría la app, así que sin el módulo
// la bienvenida se muestra sin video.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const WelcomeVideo: typeof import('../components/WelcomeVideo').WelcomeVideo | null = Platform.OS === 'web' || requireOptionalNativeModule('ExpoVideo') ? require('../components/WelcomeVideo').WelcomeVideo : null;

export default function WelcomeScreen() {
  const { loading, token, hasSignedOut } = useAuth();
  const { preview, replay, take, source } = useLocalSearchParams<{ preview?: string; replay?: string; take?: string; source?: string }>();
  const fromProfile = source === 'profile' || source === 'guest-profile';
  const allowGuestBack = source === 'guest-profile' && !hasSignedOut;
  // Development-only route for reviewing the intro without changing a saved session.
  if (__DEV__ && preview === '1') return <WelcomeExperience key={take} replay={replay === '1'} fromProfile={fromProfile} allowGuestBack={allowGuestBack} />;
  if (loading) return null;
  if (token) return <Redirect href="/home" />;
  return <WelcomeExperience fromProfile={fromProfile} allowGuestBack={allowGuestBack} />;
}

function WelcomeExperience({ replay = false, fromProfile = false, allowGuestBack = false }: { replay?: boolean; fromProfile?: boolean; allowGuestBack?: boolean }) {
  const { t, ui } = useLanguage();
  const { height, width, insets, fontScale } = useResponsiveLayout();
  const playIntro = useRef(!!WelcomeVideo && !fromProfile && (replay || !introShown)).current;
  const [phase, setPhase] = useState<'checking' | 'playing' | 'settling' | 'ready'>(playIntro ? 'checking' : 'ready');
  const [reducedMotion, setReducedMotion] = useState(false);
  const settled = phase === 'ready';
  // Keep controls readable on short screens/large text; the page can scroll after the intro.
  const heroHeight = Math.min(440, Math.max(230, height * (fontScale > 1.25 ? 0.36 : 0.48)));
  const [progress] = useState(() => new Animated.Value(playIntro ? 0 : 1));
  const finishStarted = useRef(!playIntro);
  const reveal = useCallback((immediate = false) => {
    if (finishStarted.current) {
      if (immediate) { progress.stopAnimation(); progress.setValue(1); setPhase('ready'); }
      return;
    }
    finishStarted.current = true;
    introShown = true;
    setPhase('settling');
    Animated.timing(progress, {
      toValue: 1,
      duration: immediate ? 0 : 600,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    }).start(({ finished }) => { if (finished) setPhase('ready'); });
  }, [progress]);
  const complete = useCallback(() => reveal(reducedMotion), [reveal, reducedMotion]);

  useEffect(() => {
    let active = true;
    if (playIntro) {
      AccessibilityInfo.isReduceMotionEnabled().then(enabled => {
        if (!active) return;
        setReducedMotion(enabled);
        if (enabled) reveal(true);
        else setPhase('playing');
      }).catch(() => { if (active) setPhase('playing'); });
    }
    const listener = AccessibilityInfo.addEventListener('reduceMotionChanged', enabled => {
      setReducedMotion(enabled);
      if (enabled) reveal(true);
    });
    return () => { active = false; listener.remove(); progress.stopAnimation(); };
  }, [progress, reveal, playIntro]);

  useEffect(() => {
    if (phase !== 'playing') return;
    // A decoder failure or blocked autoplay must never prevent signing in.
    const timeout = setTimeout(complete, 8000);
    return () => clearTimeout(timeout);
  }, [phase, complete]);

  const mediaHeight = progress.interpolate({ inputRange: [0, 1], outputRange: [height, heroHeight] });
  const mediaWidth = progress.interpolate({ inputRange: [0, 1], outputRange: [width, Math.min(width, heroHeight * 1.35)] });
  const contentOpacity = progress.interpolate({ inputRange: [0, 0.45, 1], outputRange: [0, 0, 1] });
  const contentTranslate = progress.interpolate({ inputRange: [0, 1], outputRange: [36, 0] });

  return (
    <View style={styles.container}>
      <StatusBar style="light" hidden={!settled} />
      {allowGuestBack && <Pressable
        accessibilityRole="button"
        accessibilityLabel={ui('Volver a explorar como invitado')}
        onPress={() => router.replace('/home')}
        style={[styles.guestBack, { top: insets.top + 8, left: insets.left + 16 }]}
      ><Ionicons name="arrow-back" size={24} color={GOLD} /></Pressable>}
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: Math.max(insets.bottom, 20) }}
        scrollEnabled={settled}
        showsVerticalScrollIndicator={false}
      >
      <Animated.View style={[styles.logoSection, { height: mediaHeight }]} testID="welcome-hero">
        <Animated.View style={{ height: '100%', width: mediaWidth, alignSelf: 'center' }}>
        {phase === 'playing' && WelcomeVideo ? <WelcomeVideo onComplete={complete} /> : <Image
          source={phase === 'checking' ? require('../../assets/videos/itc-welcome-first.jpg') : require('../../assets/videos/itc-welcome-final.jpg')}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={0}
          accessibilityRole="image"
          accessibilityLabel="ITC CLUB · New York"
        />}
        </Animated.View>
        <LinearGradient pointerEvents="none" colors={['transparent', BLACK]} style={styles.heroFade} />
      </Animated.View>

      <Animated.View
        pointerEvents={settled ? 'auto' : 'none'}
        accessibilityElementsHidden={!settled}
        importantForAccessibility={settled ? 'auto' : 'no-hide-descendants'}
        style={[
          styles.actionPanel,
          { paddingHorizontal: width < 360 ? 20 : 24 },
          {
            opacity: contentOpacity,
            transform: [{ translateY: contentTranslate }],
          },
        ]}
      >
        <View style={styles.kickerRow}>
          <Ionicons name="sparkles" size={16} color={GOLD} />
          <Text style={styles.kicker}>{ui("NYC & NJ GUIDE")}</Text>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.86}
          onPress={() => router.push('/login' as any)}
          accessibilityRole="button"
        >
          <Text style={styles.primaryText}>{t('welcome.signIn')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          activeOpacity={0.86}
          onPress={() => router.push('/register' as any)}
          accessibilityRole="button"
        >
          <Text style={styles.secondaryText}>{t('welcome.createAccount')}</Text>
        </TouchableOpacity>

        {!fromProfile && <Pressable accessibilityRole="button" hitSlop={8} onPress={() => router.replace('/home' as any)}>
          <Text style={styles.guestText}>{t('welcome.guest')}</Text>
        </Pressable>}

        {/* Aviso visible antes de usar la app; la aceptación expresa se pide al crear la cuenta. */}
        <Text style={styles.termsText}>
          {ui('Al usar ITC Club aceptas nuestros Términos y Condiciones y nuestra Política de Privacidad.')}
        </Text>
        <View style={styles.termsRow}>
          <Pressable
            accessibilityRole="link"
            hitSlop={8}
            onPress={() => router.push({ pathname: '/legal', params: { slug: 'terms' } })}
          >
            <Text style={styles.termsLink}>{ui('Términos y Condiciones')}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="link"
            hitSlop={8}
            onPress={() => router.push({ pathname: '/legal', params: { slug: 'privacy' } })}
          >
            <Text style={styles.termsLink}>{ui('Política de Privacidad')}</Text>
          </Pressable>
        </View>

        <Text style={styles.subtitle}>
          {t('welcome.subtitle')}
        </Text>
      </Animated.View>
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BLACK,
  },
  guestBack: { position: 'absolute', zIndex: 10, width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.65)' },
  logoSection: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: BLACK,
  },
  heroFade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 80 },
  actionPanel: { width: '100%', maxWidth: 560, alignSelf: 'center',
    paddingHorizontal: 24,
    paddingBottom: 12,
    paddingTop: 8,
  },
  kickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 18,
  },
  kicker: {
    color: GOLD,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
  },
  primaryButton: {
    backgroundColor: GOLD,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  primaryText: {
    color: BLACK,
    fontSize: 15,
    fontWeight: '900',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryText: {
    color: GOLD,
    fontSize: 15,
    fontWeight: '900',
  },
  termsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 18,
    rowGap: 6,
    marginTop: 8,
  },
  termsText: {
    color: '#B8B8B8',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 18,
  },
  termsLink: {
    color: GOLD,
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  guestText: {
    color: GOLD,
    textAlign: 'center',
    marginTop: 18,
    fontWeight: '800',
  },
  subtitle: {
    color: '#A6A6A6',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 18,
    textAlign: 'center',
  },
});
