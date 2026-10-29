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
import { clearRememberedLogin, readRememberedLogin, saveRememberedLogin } from '../lib/rememberedLogin';

const GOLD = '#FDDD56';
const BLACK = '#0A0A0A';

export default function LoginScreen() {
  const { t, ui } = useLanguage();
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
  const [remember, setRemember] = useState(false);
  const [rememberBusy, setRememberBusy] = useState(false);
  const edited = useRef(false);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const biometricAttempted = useRef(biometric === 'skip');

  useFocusEffect(useCallback(() => {
    let active = true;
    void readRememberedLogin().then(saved => {
      if (!active || edited.current) return;
      setRemember(!!saved);
      setEmail(saved?.email ?? '');
      setPassword(saved?.password ?? '');
    }).catch(() => { if (active) setError(ui('No se pudieron cargar tus datos guardados. Puedes escribirlos para continuar.')); });
    return () => { active = false; };
  }, [ui]));

  const toggleRemember = async () => {
    if (submitting || rememberBusy) return;
    edited.current = true;
    setError(null);
    if (!remember) { setRemember(true); return; }
    setRememberBusy(true);
    try { await clearRememberedLogin(); setRemember(false); }
    catch { setError(ui('No se pudieron borrar tus datos guardados. Inténtalo nuevamente.')); }
    finally { setRememberBusy(false); }
  };

  const enterAuthenticatedApp = () => {
    router.dismissAll();
    router.replace(returnTo === 'membership' ? '/profile?membership=1' : returnTo === 'benefits' ? '/club' : '/home');
  };

  const enterApp = async () => {
    if (submitting || rememberBusy) return;
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
      try {
        if (remember) await saveRememberedLogin(email, password);
        else await clearRememberedLogin();
      } catch {
        Alert.alert(ui('Datos de acceso'), ui('Iniciaste sesión, pero no pudimos actualizar tus datos guardados en este dispositivo.'), [{ text: 'OK', onPress: enterAuthenticatedApp }]);
        return;
      }
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
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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
          <View style={styles.header}>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={ui('Volver')} onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={22} color="#FDDD56" />
            </TouchableOpacity>

            <View style={styles.logoPill}>
              <Text style={styles.logoText}>ITC</Text>
            </View>
          </View>

          <View style={styles.content}>
            <Text style={styles.eyebrow}>{t('login.eyebrow')}</Text>
            <Text style={styles.title}>{t('login.title')}</Text>
            <Text style={styles.subtitle}>
              {t('login.subtitle')}
            </Text>

            <View style={styles.form}>
              <Text style={styles.label}>{t('login.email')}</Text>
              <TextInput
                ref={emailRef}
                value={email}
                onChangeText={value => { edited.current = true; setEmail(value); setUnregisteredEmail(null); setError(null); }}
                editable={!submitting && !rememberBusy}
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

              <Text style={styles.label}>{t('login.password')}</Text>
              <TextInput
                ref={passwordRef}
                value={password}
                onChangeText={value => { edited.current = true; setPassword(value); }}
                editable={!submitting && !rememberBusy}
                placeholder="••••••••"
                placeholderTextColor="#8A8A8A"
                secureTextEntry
                autoComplete="current-password"
                accessibilityLabel={t('login.password')}
                returnKeyType="done"
                onSubmitEditing={enterApp}
                style={styles.input}
              />

              <View style={styles.loginOptions}>
              {Platform.OS !== 'web' &&
                <Pressable accessibilityRole="checkbox" accessibilityLabel={ui('Recordar mis datos')} accessibilityState={{ checked: remember, disabled: submitting || rememberBusy }} disabled={submitting || rememberBusy} onPress={toggleRemember} style={({ pressed }) => [styles.rememberRow, pressed && { opacity: 0.7 }]}>
                  <View style={[styles.checkbox, remember && styles.checkboxChecked]}>{remember && <Ionicons name="checkmark" size={17} color={BLACK} />}</View>
                  <Text style={styles.rememberText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>{ui('Recordar mis datos')}</Text>
                </Pressable>}
              <Pressable style={styles.forgotButton} accessibilityRole="button" onPress={() => router.push({ pathname: '/forgot-password', params: { email: email.trim() } })}>
                <Text style={[styles.forgotText, styles.forgotInline]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>{t('login.forgot')}</Text>
              </Pressable>
              </View>

              {error && <Text style={styles.errorText}>{error}</Text>}
            </View>
          </View>

          <View style={styles.footer}>
          <TouchableOpacity accessibilityRole="button"
            style={[styles.primaryButton, submitting && styles.primaryButtonDisabled]}
            onPress={enterApp}
            disabled={submitting || rememberBusy}
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
                    { text: ui('Olvidar cuenta'), style: 'destructive', onPress: () => { edited.current = true; void forgetBiometric().then(() => { setRemember(false); setEmail(''); setPassword(''); }).catch(() => setError(ui('No se pudo olvidar la cuenta. Inténtalo nuevamente.'))); } },
                  ]);
                }}><Text style={styles.forgotText}>{ui('Olvidar esta cuenta en el dispositivo')}</Text></Pressable>
            )}

            {!unregisteredEmail && <Pressable accessibilityRole="link" onPress={() => router.push({ pathname: '/register', params: { email: email.trim() } })}>
              <Text style={styles.switchText}>
                {t('login.noAccount')} <Text style={styles.switchAccent}>{t('login.createAccount')}</Text>
              </Text>
            </Pressable>}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loginOptions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rememberRow: { minHeight: 48, flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: { width: 20, height: 20, flexShrink: 0, borderRadius: 5, borderWidth: 1, borderColor: '#8A8A8A', alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: GOLD, borderColor: GOLD },
  rememberText: { color: '#FFF', fontSize: 13, flexShrink: 1 },
  forgotButton: { minHeight: 48, flex: 1.1, justifyContent: 'center' },
  forgotInline: { fontSize: 13 },
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
    paddingHorizontal: 22,
    paddingBottom: 28,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPill: {
    backgroundColor: GOLD,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  logoText: {
    color: BLACK,
    fontSize: 16,
    fontWeight: '900',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 28,
  },
  eyebrow: {
    color: GOLD,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 14,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 40,
  },
  subtitle: {
    color: '#A7A7A7',
    fontSize: 15,
    lineHeight: 23,
    marginTop: 12,
  },
  form: {
    marginTop: 34,
  },
  label: {
    color: '#EAEAEA',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 12,
    color: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 15,
    marginBottom: 16,
  },
  forgotText: {
    color: GOLD,
    fontWeight: '700',
    textAlign: 'right',
  },
  footer: {
    paddingTop: 24,
  },
  primaryButton: {
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
