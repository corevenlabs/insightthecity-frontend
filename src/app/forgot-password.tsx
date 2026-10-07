import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL } from '../constants/api';
import { useLanguage } from '../context/LanguageContext';

const GOLD = '#FDDD56';
const COPY = {
  es: { title: 'Recupera tu contraseña', intro: 'Ingresa tu correo y te enviaremos un código de 8 dígitos.', email: 'Correo electrónico', send: 'ENVIAR CÓDIGO', code: 'Código de recuperación', newPassword: 'Nueva contraseña', confirm: 'Confirmar contraseña', save: 'CAMBIAR CONTRASEÑA', sent: 'Si existe una cuenta con ese correo, recibirás un código. Revisa también el correo no deseado.', success: 'Contraseña actualizada. Ya puedes iniciar sesión.', retry: 'Enviar otro código', mismatch: 'Las contraseñas no coinciden.', short: 'La contraseña debe tener al menos 8 caracteres.', invalidEmail: 'Ingresa un correo válido.', invalidCode: 'Ingresa el código de 8 dígitos.', error: 'No pudimos completar la solicitud. Inténtalo de nuevo.', back: 'Volver al inicio de sesión' },
  en: { title: 'Reset your password', intro: 'Enter your email and we will send you an 8-digit code.', email: 'Email address', send: 'SEND CODE', code: 'Recovery code', newPassword: 'New password', confirm: 'Confirm password', save: 'CHANGE PASSWORD', sent: 'If an account exists for this email, you will receive a code. Check your spam folder too.', success: 'Password updated. You can now sign in.', retry: 'Send another code', mismatch: 'Passwords do not match.', short: 'Password must be at least 8 characters.', invalidEmail: 'Enter a valid email address.', invalidCode: 'Enter the 8-digit code.', error: 'We could not complete this request. Please try again.', back: 'Back to sign in' },
  pt: { title: 'Recupere sua senha', intro: 'Digite seu e-mail e enviaremos um código de 8 dígitos.', email: 'E-mail', send: 'ENVIAR CÓDIGO', code: 'Código de recuperação', newPassword: 'Nova senha', confirm: 'Confirmar senha', save: 'ALTERAR SENHA', sent: 'Se houver uma conta com este e-mail, você receberá um código. Verifique também a pasta de spam.', success: 'Senha atualizada. Agora você pode entrar.', retry: 'Enviar outro código', mismatch: 'As senhas não coincidem.', short: 'A senha deve ter pelo menos 8 caracteres.', invalidEmail: 'Digite um e-mail válido.', invalidCode: 'Digite o código de 8 dígitos.', error: 'Não foi possível concluir a solicitação. Tente novamente.', back: 'Voltar ao login' },
};

async function post(path: string, body: object) {
  const response = await fetch(`${API_URL}/api/users/password-reset/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.success) throw new Error(data?.message || 'Request failed');
}

export default function ForgotPasswordScreen() {
  const { language } = useLanguage();
  const c = COPY[language];
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(typeof params.email === 'string' ? params.email : '');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [step, setStep] = useState<'request' | 'confirm' | 'done'>('request');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const send = async () => {
    if (busy) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError(c.invalidEmail);
    setBusy(true); setError('');
    try { await post('request', { email: email.trim() }); setStep('confirm'); }
    catch (err) { setError(err instanceof Error && err.message !== 'Request failed' ? err.message : c.error); }
    finally { setBusy(false); }
  };

  const changePassword = async () => {
    if (busy) return;
    if (!/^\d{8}$/.test(code)) return setError(c.invalidCode);
    if (password.length < 8) return setError(c.short);
    if (password !== confirmation) return setError(c.mismatch);
    setBusy(true); setError('');
    try { await post('confirm', { email: email.trim(), code, password }); setPassword(''); setConfirmation(''); setCode(''); setStep('done'); }
    catch (err) { setError(err instanceof Error && err.message !== 'Request failed' ? err.message : c.error); }
    finally { setBusy(false); }
  };

  return <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
    <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Pressable accessibilityRole="button" accessibilityLabel={c.back} onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={25} color={GOLD} /></Pressable>
        <Text style={styles.eyebrow}>ITC CLUB</Text>
        <Text style={styles.title}>{c.title}</Text>
        <Text style={styles.subtitle}>{step === 'done' ? c.success : step === 'confirm' ? c.sent : c.intro}</Text>
        {step !== 'done' && <>
          <Text style={styles.label}>{c.email}</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" editable={step === 'request' && !busy} placeholder="name@example.com" placeholderTextColor="#8A8A8A" accessibilityLabel={c.email} />
          {step === 'confirm' && <>
            <Text style={styles.label}>{c.code}</Text>
            <TextInput style={styles.input} value={code} onChangeText={(value) => setCode(value.replace(/\D/g, '').slice(0, 8))} keyboardType="number-pad" maxLength={8} autoComplete="one-time-code" placeholder="00000000" placeholderTextColor="#8A8A8A" accessibilityLabel={c.code} />
            <Text style={styles.label}>{c.newPassword}</Text>
            <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" accessibilityLabel={c.newPassword} />
            <Text style={styles.label}>{c.confirm}</Text>
            <TextInput style={styles.input} value={confirmation} onChangeText={setConfirmation} secureTextEntry autoComplete="new-password" accessibilityLabel={c.confirm} />
          </>}
          {!!error && <Text style={styles.error} accessibilityRole="alert">{error}</Text>}
          <Pressable accessibilityRole="button" disabled={busy} style={[styles.button, busy && styles.disabled]} onPress={step === 'request' ? send : changePassword}>{busy ? <ActivityIndicator color="#0A0A0A" /> : <Text style={styles.buttonText}>{step === 'request' ? c.send : c.save}</Text>}</Pressable>
          {step === 'confirm' && <Pressable accessibilityRole="button" disabled={busy} onPress={send} style={styles.retry}><Text style={styles.retryText}>{c.retry}</Text></Pressable>}
        </>}
        {step === 'done' && <Pressable accessibilityRole="button" style={styles.button} onPress={() => router.replace('/login')}><Text style={styles.buttonText}>{c.back}</Text></Pressable>}
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' }, fill: { flex: 1 }, content: { width: '100%', maxWidth: 560, alignSelf: 'center', flexGrow: 1, padding: 24, paddingBottom: 40 },
  back: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 42 },
  eyebrow: { color: GOLD, fontSize: 12, fontWeight: '800', letterSpacing: 2, marginBottom: 14 },
  title: { color: '#FFF', fontSize: 32, fontWeight: '900', lineHeight: 39 },
  subtitle: { color: '#A7A7A7', fontSize: 15, lineHeight: 23, marginTop: 12, marginBottom: 30 },
  label: { color: '#EAEAEA', fontSize: 13, fontWeight: '700', marginBottom: 8 },
  input: { backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#333', borderRadius: 12, color: '#FFF', paddingHorizontal: 16, paddingVertical: 15, marginBottom: 18, fontSize: 16 },
  button: { backgroundColor: GOLD, borderRadius: 14, minHeight: 56, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  disabled: { opacity: 0.6 }, buttonText: { color: '#0A0A0A', fontSize: 15, fontWeight: '900' },
  retry: { alignSelf: 'center', padding: 14, marginTop: 16 }, retryText: { color: GOLD, fontSize: 14, fontWeight: '700' },
  error: { color: '#FF8080', fontSize: 14, marginBottom: 10 },
});
