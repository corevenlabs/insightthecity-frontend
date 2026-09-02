import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const GOLD = '#D4AF37';
const BLACK = '#0A0A0A';

export default function LoginScreen() {
  const { t } = useLanguage();
  const {
    biometricAvailable,
    biometricEnabled,
    biometricLabel,
    enableBiometric,
    signIn,
    token,
    unlockWithBiometrics,
  } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const passwordRef = useRef<TextInput>(null);

  const enterAuthenticatedApp = () => {
    router.dismissAll();
    router.replace('/home' as any);
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
    try {
      await signIn(email.trim(), password);
      if (biometricAvailable && !biometricEnabled) {
        Alert.alert(
          t('login.enableTitle', { biometric: biometricLabel }),
          t('login.enableMessage', { biometric: biometricLabel }),
          [
            { text: t('login.notNow'), onPress: enterAuthenticatedApp },
            {
              text: t('login.enable'),
              onPress: async () => {
                await enableBiometric();
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

  const enterWithBiometrics = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await unlockWithBiometrics();
      enterAuthenticatedApp();
    } catch (err: any) {
      setError(err?.message ?? `No se pudo ingresar con ${biometricLabel}.`);
    } finally {
      setSubmitting(false);
    }
  };

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
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={22} color={GOLD} />
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
                placeholder="tu@email.com"
                placeholderTextColor="#666"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
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
                placeholderTextColor="#666"
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={enterApp}
                style={styles.input}
              />

              <Pressable>
                <Text style={styles.forgotText}>{t('login.forgot')}</Text>
              </Pressable>

              {error && <Text style={styles.errorText}>{error}</Text>}
            </View>
          </View>

          <View style={styles.footer}>
          <TouchableOpacity
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

            {biometricEnabled && token && (
              <>
                <View style={styles.separatorRow}>
                  <View style={styles.separatorLine} />
                  <Text style={styles.separatorText}>{t('login.or')}</Text>
                  <View style={styles.separatorLine} />
                </View>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={`Ingresar con ${biometricLabel}`}
                  activeOpacity={0.72}
                  style={styles.biometricButton}
                  onPress={enterWithBiometrics}
                  disabled={submitting}
                >
                  <Ionicons name="scan-outline" size={22} color={GOLD} />
                  <Text style={styles.biometricText}>
                    {t('login.biometric', { biometric: biometricLabel.toUpperCase() })}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <Pressable onPress={() => router.push('/register' as any)}>
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
  scrollContent: {
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
