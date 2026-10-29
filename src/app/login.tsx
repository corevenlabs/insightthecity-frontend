import { LoginHero } from '../components/LoginHero';
import { AuthSocialButtons } from '../components/AuthSocialButtons';
import { WelcomeLanguagePicker } from '../components/WelcomeLanguagePicker';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { StatusBar } from 'expo-status-bar';
import { Text, TextInput } from '../components/typography';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const GOLD = '#FDDD56';
const BLACK = '#0A0A0A';

export default function LoginScreen() {
  const { t, ui } = useLanguage();
  const { height, width, insets } = useResponsiveLayout();
  const heroHeight = Math.min(360, Math.max(240, height * 0.34));
  const [showPassword, setShowPassword] = useState(false);
  const { returnTo, biometric } = useLocalSearchParams<{ returnTo?: string; biometric?: string }>();
  const {
    loading,
    biometricAvailable,
    biometricEnabled,
    biometricLabel,
    enableBiometric,
    signIn,
    forgetBiometric,
    unlockWithBiometrics,
  } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [unregisteredEmail, setUnregisteredEmail] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const biometricAttempted = useRef(biometric === 'skip');

  const enterAuthenticatedApp = () => {
    router.dismissAll();
    router.replace(returnTo === 'membership' ? '/profile?membership=1' : returnTo === 'benefits' ? '/club' : '/home');
  };

  const enterApp = async () => {
    if (submitting) return;
    Keyboard.dismiss();
    setError(null);
    setUnregisteredEmail(null);

    if (!email.trim() || !password) {
      setError(t('login.required'));
      return;
    }

    setSubmitting(true);
    // Al activar Face ID tras este ingreso, biometricEnabled cambia en esta misma
    // pantalla: no debe disparar además el desbloqueo automático.
    biometricAttempted.current = true;
    try {
      await signIn(email.trim(), password);
      if (biometricAvailable) {
        Alert.alert(
          t('login.enableTitle', { biometric: biometricLabel }),
          t('login.enableMessage', { biometric: biometricLabel }),
          [
            { text: t('login.notNow'), onPress: enterAuthenticatedApp },
            {
              text: t('login.enable'),
              onPress: async () => {
                try {
                  await enableBiometric();
                } catch {
                  Alert.alert(ui('No se pudo activar el acceso biométrico'), ui('Puedes seguir entrando con tu correo y contraseña.'));
                }
                enterAuthenticatedApp();
              },
            },
          ]
        );
      } else {
        enterAuthenticatedApp();
      }
    } catch (err: any) {
      if (err?.code === 'ACCOUNT_NOT_FOUND') setUnregisteredEmail(email.trim());
      else setError(err?.code === 'INVALID_PASSWORD' ? ui('La contraseña no es correcta.') : err?.code === 'LOGIN_PROVIDER_REQUIRED' ? ui('Esta cuenta usa Apple o Google. Usa tu acceso habitual o recupera la contraseña.') : err?.message ?? t('login.genericError'));
    } finally {
      setSubmitting(false);
    }
  };

  useFocusEffect(useCallback(() => {
    if (loading || !biometricEnabled || !biometricAvailable || biometricAttempted.current) return;
    let active = true;
    // Wait for the login transition, then request biometrics once per screen visit.
    const timer = setTimeout(() => {
      biometricAttempted.current = true;
      setSubmitting(true);
      setError(null);
      void unlockWithBiometrics().then(() => {
        if (!active) return;
        router.dismissAll();
        router.replace(returnTo === 'membership' ? '/profile?membership=1' : returnTo === 'benefits' ? '/club' : '/home');
      }).catch(() => {
        if (active) setError(ui('Puedes iniciar sesión con tu correo y contraseña.'));
      }).finally(() => setSubmitting(false));
    }, 300);
    return () => { active = false; clearTimeout(timer); };
  }, [loading, biometricEnabled, biometricAvailable, unlockWithBiometrics, returnTo, ui]));

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <StatusBar style="light" />
      <View style={[styles.header, { top: insets.top + 8, left: 16, right: 16 }]} pointerEvents="box-none">
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={ui('Volver')} onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={GOLD} />
        </TouchableOpacity>
        <WelcomeLanguagePicker />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        >
          <LoginHero height={heroHeight} width={Math.min(width - insets.left - insets.right, 560)} />

          <View style={styles.content}>
            <Text style={styles.title}>{t('login.title')}</Text>
            <Text style={styles.subtitle}>
              {t('login.subtitle')}
            </Text>

            <View style={styles.form}>
              <Text style={styles.label}>{t('login.email')}</Text>
              <View style={styles.inputRow}>
                <Ionicons name="mail-outline" size={22} color="#D6D6D6" accessible={false} />
                <TextInput
                  ref={emailRef}
                  value={email}
                  onChangeText={value => { setEmail(value); setUnregisteredEmail(null); setError(null); }}
                  placeholder="name@example.com"
                  placeholderTextColor="#8A8A8A"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  accessibilityLabel={t('login.email')}
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  submitBehavior="submit"
                  style={styles.input}
                />
              </View>

              <Text style={styles.label}>{t('login.password')}</Text>
              <View style={styles.inputRow}>
                <Ionicons name="lock-closed-outline" size={21} color="#D6D6D6" accessible={false} />
                <TextInput
                  ref={passwordRef}
                  value={password}
                  onChangeText={setPassword}
                  placeholder={ui('Tu contraseña')}
                  placeholderTextColor="#8A8A8A"
                  secureTextEntry={!showPassword}
                  autoComplete="current-password"
                  accessibilityLabel={t('login.password')}
                  returnKeyType="done"
                  onSubmitEditing={enterApp}
                  style={styles.input}
                />
                <Pressable style={styles.eye} accessibilityRole="button" accessibilityLabel={ui(showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña')} onPress={() => setShowPassword(value => !value)}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color="#BDBDBD" />
                </Pressable>
              </View>

              <Pressable style={styles.forgotAction} accessibilityRole="button" onPress={() => router.push({ pathname: '/forgot-password', params: { email: email.trim() } })}>
                <Text style={styles.forgotText}>{t('login.forgot')}</Text>
              </Pressable>

              {error && <Text style={styles.errorText} accessibilityRole="alert">{error}</Text>}
            </View>
          </View>

          <View style={styles.footer}>
          <TouchableOpacity accessibilityRole="button"
            style={[styles.primaryButton, submitting && styles.primaryButtonDisabled]}
            onPress={enterApp}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={BLACK} />
            ) : (
              <Text style={styles.primaryText}>{t('login.submit')}</Text>
            )}
          </TouchableOpacity>

            {unregisteredEmail && <View style={styles.accountNotice} accessibilityLiveRegion="polite">
              <View style={styles.noticeHeading}><Ionicons name="information-circle-outline" size={22} color={GOLD} /><Text style={styles.noticeTitle}>{ui('Este correo aún no tiene cuenta')}</Text></View>
              <Text style={styles.noticeText}>{ui('No encontramos una cuenta con {email}. Puedes crear una con este mismo correo.', { email: unregisteredEmail })}</Text>
              <TouchableOpacity accessibilityRole="button" style={styles.primaryButton} onPress={() => { setPassword(''); router.push({ pathname: '/register', params: { email: unregisteredEmail } }); }}>
                <Text style={styles.primaryText}>{t('register.submit')}</Text>
              </TouchableOpacity>
              <Pressable accessibilityRole="button" style={styles.otherEmail} onPress={() => { setUnregisteredEmail(null); setError(null); setEmail(''); setPassword(''); emailRef.current?.focus(); }}>
                <Text style={styles.switchAccent}>{ui('Usar otro correo')}</Text>
              </Pressable>
            </View>}

            {biometricEnabled && (
                <Pressable accessibilityRole="button" disabled={submitting} onPress={() => {
                  Alert.alert(ui('Olvidar esta cuenta en el dispositivo'), ui('Se eliminará el acceso biométrico. Podrás entrar con tu correo y contraseña.'), [
                    { text: ui('Cancelar'), style: 'cancel' },
                    { text: ui('Olvidar cuenta'), style: 'destructive', onPress: () => { void forgetBiometric().catch(() => setError(ui('No se pudo olvidar la cuenta. Inténtalo nuevamente.'))); } },
                  ]);
                }}><Text style={styles.forgotText}>{ui('Olvidar esta cuenta en el dispositivo')}</Text></Pressable>
            )}

            <AuthSocialButtons onSuccess={enterAuthenticatedApp} />

            {!unregisteredEmail && <Pressable accessibilityRole="link" onPress={() => router.push({ pathname: '/register', params: { email: email.trim() } })}>
              <Text style={styles.switchText}>
                {t('login.noAccount')} <Text style={styles.switchAccent}>{t('login.createAccount')}</Text>
              </Text>
            </Pressable>}
            <Pressable accessibilityRole="button" style={styles.guestAction} onPress={() => { router.dismissAll(); router.replace('/home'); }}>
              <Text style={styles.guestText}>{t('welcome.guest')}  →</Text>
            </Pressable>
            <Text style={styles.legalNotice}>{ui('Al usar ITC Club aceptas nuestros Términos y Condiciones y nuestra Política de Privacidad.')}</Text>
            <View style={styles.legalLinks}>
              {(['terms', 'privacy'] as const).map(slug => <Pressable key={slug} accessibilityRole="link" style={styles.legalAction} onPress={() => router.push({ pathname: '/legal', params: { slug } })}>
                <Text style={styles.legalText}>{ui(slug === 'terms' ? 'Términos y Condiciones' : 'Política de Privacidad')}</Text>
              </Pressable>)}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  accountNotice: { borderWidth: 1, borderColor: GOLD, borderRadius: 14, backgroundColor: '#121212', padding: 16, gap: 14, marginTop: 18 },
  noticeHeading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  noticeTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', flex: 1 },
  noticeText: { color: '#B8B8B8', fontSize: 14, lineHeight: 21 },
  otherEmail: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  container: {
    flex: 1,
    backgroundColor: BLACK,
  },
  flex: {
    flex: 1,
  },
  scrollContent: { width: '100%', maxWidth: 560, alignSelf: 'center',
    flexGrow: 1,
    paddingBottom: 28,
  },
  header: { position: 'absolute', zIndex: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(5,5,5,0.65)', alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 22, marginTop: -4 },
  eyebrow: {
    color: GOLD,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 14,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 36,
  },
  subtitle: {
    color: '#A7A7A7',
    fontSize: 15,
    lineHeight: 23,
    marginTop: 12,
  },
  form: {
    marginTop: 24,
  },
  label: {
    color: '#EAEAEA',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingLeft: 16, backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#333', borderRadius: 12, marginBottom: 14 },
  input: { flex: 1, minWidth: 0, minHeight: 54, color: '#FFF', paddingVertical: 15, paddingRight: 12 },
  eye: { minWidth: 44, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  forgotAction: { minHeight: 44, alignItems: 'flex-end', justifyContent: 'center' },
  forgotText: {
    color: GOLD,
    fontWeight: '700',
    textAlign: 'right',
  },
  footer: {
    paddingTop: 12,
    paddingHorizontal: 22,
  },
  primaryButton: {
    minHeight: 56,
    backgroundColor: GOLD,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryText: {
    color: BLACK,
    fontSize: 15,
    fontWeight: '900',
  },
  separatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 18,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#2B2B2B',
  },
  separatorText: {
    color: '#888',
    fontSize: 12,
    fontWeight: '800',
  },
  biometricButton: {
    minHeight: 56,
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: 14,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  biometricText: {
    color: GOLD,
    fontSize: 14,
    fontWeight: '900',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 14,
  },
  guestAction: { minHeight: 48, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  guestText: { color: GOLD, fontSize: 14, fontWeight: '700', textAlign: 'center' },
  legalNotice: { color: '#B0B0B0', fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 12 },
  legalLinks: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', columnGap: 16 },
  legalAction: { minHeight: 44, justifyContent: 'center' }, legalText: { color: GOLD, fontSize: 12, textAlign: 'center' },
  switchText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 18,
    fontWeight: '700',
  },
  switchAccent: {
    color: GOLD,
  },
});
