import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
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
import { useLanguage, type AppLanguage } from '../context/LanguageContext';

const GOLD = '#D4AF37';
const BLACK = '#0A0A0A';

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const { language, setLanguage, t, ui } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [acceptedLegal, setAcceptedLegal] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const createAccount = async () => {
    if (submitting) return;
    Keyboard.dismiss();
    setError(null);

    if (!name.trim() || !email.trim() || !password) {
      setError(t('register.required'));
      return;
    }
    if (password.length < 8) {
      setError(t('register.passwordError'));
      return;
    }
    if (!acceptedLegal) {
      setError(ui('Para crear tu cuenta debes aceptar los Términos y la Política de Privacidad.'));
      return;
    }

    setSubmitting(true);
    try {
      await signUp(name.trim(), email.trim(), password, language, acceptedLegal);
      router.dismissAll();
      router.replace('/home' as any);
    } catch (err: any) {
      setError(err?.message ?? t('register.genericError'));
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
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
              accessibilityRole="button"
              accessibilityLabel={ui('Volver')}
            >
              <Ionicons name="arrow-back" size={22} color="#D4AF37" />
            </TouchableOpacity>

            <View style={styles.logoPill}>
              <Text style={styles.logoText}>ITC</Text>
            </View>
          </View>

          <View style={styles.content}>
            <Text style={styles.eyebrow}>{t('register.eyebrow')}</Text>
            <Text style={styles.title}>{t('register.title')}</Text>
            <Text style={styles.subtitle}>
              {t('register.subtitle')}
            </Text>

            <View style={styles.form}>
              <Text style={styles.label}>{t('register.name')}</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder={t('register.namePlaceholder')}
                placeholderTextColor="#8A8A8A"
                autoCapitalize="words"
                autoComplete="name"
                accessibilityLabel={t('register.name')}
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
                submitBehavior="submit"
                style={styles.input}
              />

              <Text style={styles.label}>{t('register.email')}</Text>
              <TextInput
                ref={emailRef}
                value={email}
                onChangeText={setEmail}
                placeholder="name@example.com"
                placeholderTextColor="#8A8A8A"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                accessibilityLabel={t('register.email')}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                submitBehavior="submit"
                style={styles.input}
              />

              <Text style={styles.label}>{t('register.password')}</Text>
              <TextInput
                ref={passwordRef}
                value={password}
                onChangeText={setPassword}
                placeholder={t('register.passwordPlaceholder')}
                placeholderTextColor="#8A8A8A"
                secureTextEntry
                autoComplete="new-password"
                accessibilityLabel={t('register.password')}
                returnKeyType="done"
                onSubmitEditing={createAccount}
                style={styles.input}
              />

              <Text style={styles.label}>{t('register.language')}</Text>
              <Text style={styles.languageHint}>{t('register.languageHint')}</Text>
              <View style={styles.languageOptions} accessibilityRole="radiogroup">
                {([
                  ['es', 'language.spanish'],
                  ['en', 'language.english'],
                  ['pt', 'language.portuguese'],
                ] as const).map(([code, labelKey]) => {
                  const selected = language === code;
                  return (
                    <Pressable
                      key={code}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      accessibilityLabel={t(labelKey)}
                      onPress={() => void setLanguage(code as AppLanguage)}
                      style={({ pressed }) => [
                        styles.languageOption,
                        selected && styles.languageOptionSelected,
                        pressed && styles.languageOptionPressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.languageOptionText,
                          selected && styles.languageOptionTextSelected,
                        ]}
                      >
                        {t(labelKey)}
                      </Text>
                      {selected && <Ionicons name="checkmark-circle" size={18} color={BLACK} />}
                    </Pressable>
                  );
                })}
              </View>

              <Pressable
                style={styles.consentRow}
                onPress={() => setAcceptedLegal((value) => !value)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: acceptedLegal }}
              >
                <View style={[styles.checkbox, acceptedLegal && styles.checkboxActive]}>
                  {acceptedLegal && <Ionicons name="checkmark" size={16} color={BLACK} />}
                </View>
                <Text style={styles.consentText}>
                  {ui('Tengo 18 años o más y acepto los Términos y Condiciones y la Política de Privacidad de ITC Club.')}
                </Text>
              </Pressable>
              <View style={styles.legalLinks}>
                <Pressable
                  accessibilityRole="link"
                  hitSlop={8}
                  onPress={() => router.push({ pathname: '/legal', params: { slug: 'terms' } })}
                >
                  <Text style={styles.legalLink}>{ui('Leer Términos y Condiciones')}</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="link"
                  hitSlop={8}
                  onPress={() => router.push({ pathname: '/legal', params: { slug: 'privacy' } })}
                >
                  <Text style={styles.legalLink}>{ui('Leer Política de Privacidad')}</Text>
                </Pressable>
              </View>

              {error && <Text style={styles.errorText} accessibilityRole="alert" accessibilityLiveRegion="polite">{error}</Text>}
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.primaryButton, (submitting || !acceptedLegal) && styles.primaryButtonDisabled]}
              onPress={createAccount}
              disabled={submitting || !acceptedLegal}
              accessibilityRole="button"
              accessibilityState={{ disabled: submitting || !acceptedLegal, busy: submitting }}
            >
              {submitting ? (
                <ActivityIndicator color={BLACK} />
              ) : (
                <Text style={styles.primaryText}>{t('register.submit')}</Text>
              )}
            </TouchableOpacity>

            <Pressable accessibilityRole="link" onPress={() => router.push('/login' as any)}>
              <Text style={styles.switchText}>
                {t('register.hasAccount')} <Text style={styles.switchAccent}>{t('register.signIn')}</Text>
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
    marginTop: 28,
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
  languageHint: {
    color: '#8F8F8F',
    fontSize: 12,
    lineHeight: 17,
    marginTop: -2,
    marginBottom: 10,
  },
  languageOptions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  languageOption: {
    minHeight: 48,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2B2B2B',
    backgroundColor: '#171717',
  },
  languageOptionSelected: {
    borderColor: GOLD,
    backgroundColor: GOLD,
  },
  languageOptionPressed: {
    opacity: 0.72,
  },
  languageOptionText: {
    color: '#D6D6D6',
    fontSize: 12,
    fontWeight: '800',
  },
  languageOptionTextSelected: {
    color: BLACK,
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
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 18,
    paddingVertical: 6,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxActive: {
    backgroundColor: GOLD,
  },
  consentText: {
    flex: 1,
    color: '#EAEAEA',
    fontSize: 14,
    lineHeight: 20,
  },
  legalLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 18,
    rowGap: 8,
    marginTop: 8,
    marginLeft: 36,
    marginBottom: 6,
  },
  legalLink: {
    color: GOLD,
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 4,
  },
  switchText: {
    color: '#A6A6A6',
    textAlign: 'center',
    marginTop: 18,
    fontWeight: '700',
  },
  switchAccent: {
    color: GOLD,
  },
});
