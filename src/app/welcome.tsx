import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const GOLD = '#D4AF37';
const BLACK = '#050505';

export default function WelcomeScreen() {
  const { t, ui } = useLanguage();
  const { height } = useResponsiveLayout();
  const { loading, token } = useAuth();
  const [content] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(content, {
      toValue: 1,
      duration: 700,
      delay: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [content]);

  const contentTranslate = content.interpolate({
    inputRange: [0, 1],
    outputRange: [28, 0],
  });

  if (loading) return null;
  if (token) return <Redirect href="/home" />;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
      <View style={styles.logoSection}>
        <Image
          source={require('@/assets/images/itc-login-logo.gif')}
          style={[styles.animatedLogo, { height: Math.min(420, Math.max(180, height * 0.45)) }]}
          contentFit="contain"
          transition={0}
          accessibilityRole="image"
          accessibilityLabel="Insight The City"
        />
      </View>

      <Animated.View
        style={[
          styles.actionPanel,
          {
            opacity: content,
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

        <Pressable accessibilityRole="button" hitSlop={8} onPress={() => router.replace('/home' as any)}>
          <Text style={styles.guestText}>{t('welcome.guest')}</Text>
        </Pressable>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BLACK,
  },
  logoSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  animatedLogo: {
    width: '88%',
    maxWidth: 520,
    maxHeight: 420,
  },
  actionPanel: { width: '100%', maxWidth: 560, alignSelf: 'center',
    paddingHorizontal: 24,
    paddingBottom: 30,
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
