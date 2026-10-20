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
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
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
  const [submitting, setSubmitting] = useState(false);

  const passwordRef = useRef<TextInput>(null);
  const biometricAttempted = useRef(false);

  const enterAuthenticatedApp = () => {
    router.dismissAll();
    router.replace(returnTo === 'membership' ? '/profile?membership=1' : returnTo === 'benefits' ? '/club' : '/home');
  };

  const enterApp = async () => {
    if (submitting) return;
    Keyboard.dismiss();
    setError(null);

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
      setError(err?.message ?? t('login.genericError'));
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
                value={email}
                onChangeText={setEmail}
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
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#8A8A8A"
                secureTextEntry
                autoComplete="current-password"
                accessibilityLabel={t('login.password')}
                returnKeyType="done"
                onSubmitEditing={enterApp}
                style={styles.input}
              />

              <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/forgot-password', params: { email: email.trim() } })}>
                <Text style={styles.forgotText}>{t('login.forgot')}</Text>
              </Pressable>

              {error && <Text style={styles.errorText}>{error}</Text>}
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

            {biometricEnabled && (
                <Pressable accessibilityRole="button" disabled={submitting} onPress={() => {
                  Alert.alert(ui('Olvidar esta cuenta en el dispositivo'), ui('Se eliminará el acceso biométrico. Podrás entrar con tu correo y contraseña.'), [
                    { text: ui('Cancelar'), style: 'cancel' },
                    { text: ui('Olvidar cuenta'), style: 'destructive', onPress: () => { void forgetBiometric().catch(() => setError(ui('No se pudo olvidar la cuenta. Inténtalo nuevamente.'))); } },
                  ]);
                }}><Text style={styles.forgotText}>{ui('Olvidar esta cuenta en el dispositivo')}</Text></Pressable>
            )}

            <Pressable accessibilityRole="link" onPress={() => router.push('/register' as any)}>
              <Text style={styles.switchText}>
                {t('login.noAccount')} <Text style={styles.switchAccent}>{t('login.createAccount')}</Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
