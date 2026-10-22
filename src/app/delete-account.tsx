import { Text, TextInput } from '../components/typography';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { API_URL } from '../constants/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const GOLD = '#FDDD56';
const RED = '#FF8080';

// Eliminación de cuenta desde la app (App Store 5.1.1(v) / Google Play).
// Borra la cuenta y los datos personales y cancela la membresía de Stripe.
export default function DeleteAccountScreen() {
  const { ui, language } = useLanguage();
  const { user, deleteAccount } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [challenge, setChallenge] = useState('');
  const [code, setCode] = useState('');
  const [sending, setSending] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const useEmail = user?.has_password === false;
  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = setTimeout(() => setResendSeconds(value => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendSeconds]);
  const sendCode = async () => {
    if (sending || busy || resendSeconds > 0 || !user?.email) return;
    setSending(true); setError('');
    try {
      const response = await fetch(`${API_URL}/api/account-deletions/request-code`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({email:user.email,language}),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.challenge) throw new Error(ui('No se pudo enviar el código. Inténtalo de nuevo.'));
      setChallenge(data.challenge); setCode(''); setResendSeconds(60);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : ui('No se pudo enviar el código. Inténtalo de nuevo.'));
    } finally { setSending(false); }
  };

  const canDelete = confirmed && (useEmail ? !!challenge && /^\d{8}$/.test(code) : password.length > 0) && !busy && !sending;

  const submit = async () => {
    if (!canDelete) return;
    setBusy(true);
    setError('');
    try {
      await deleteAccount(password, useEmail ? {challenge,code} : undefined);
      Alert.alert(ui('Solicitud de eliminación recibida'), ui('Tu cuenta está bloqueada y la eliminación está en proceso. Te enviaremos un correo cuando termine. Si no recibes la confirmación en 48 horas, contacta a ITC Club.'), [{ text: 'OK', onPress: () => { router.dismissAll(); router.replace('/welcome'); } }]);
    } catch (err) {
      setError(err instanceof Error ? ui(err.message) : ui('No se pudo eliminar la cuenta.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={ui('Volver')}
            hitSlop={10}
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={GOLD} />
          </Pressable>
          <Text style={styles.headerTitle} accessibilityRole="header">{ui('Eliminar cuenta')}</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.lead}>{ui('Esta acción es permanente y no se puede deshacer.')}</Text>
          <Text style={styles.body}>{ui('Al eliminar tu cuenta:')}</Text>
          {[
            ui('Borramos tu perfil, tu foto, tus mensajes del chat y tus códigos de beneficios.'),
            ui('Solicitamos la cancelación de tu membresía en Stripe antes de borrar la cuenta. Si ocurre un problema, reintentamos y te confirmamos cuando termine.'),
            ui('Pierdes el acceso a las guías que compraste.'),
            ui('Stripe puede conservar el registro de tus pagos por obligaciones legales y fiscales.'),
          ].map((item) => (
            <View key={item} style={styles.listItem}>
              <Text style={styles.bullet} accessible={false}>•</Text>
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}

          <Text style={styles.body}>{ui('Normalmente se procesa al solicitarla. Si hay un fallo, puede tardar más. Te enviaremos la confirmación por correo; si no llega en 48 horas, contacta a ITC Club.')}</Text>

          {user?.email ? <Text style={styles.account}>{ui('Cuenta: {email}', { email: user.email })}</Text> : null}

          {useEmail ? <>
            <Text style={styles.body}>{ui('Para eliminar tu cuenta, confirma tu identidad con el código que enviaremos a tu correo registrado.')}</Text>
            <Pressable style={styles.cancelButton} accessibilityRole="button" disabled={sending || busy || resendSeconds > 0} onPress={() => { void sendCode(); }} accessibilityState={{disabled:sending || busy || resendSeconds > 0,busy:sending}}>
              {sending ? <ActivityIndicator color={GOLD} /> : <Text style={styles.cancelText}>{ui(challenge ? 'Reenviar código' : 'Enviar código de confirmación')}{resendSeconds > 0 ? ` (${resendSeconds}s)` : ''}</Text>}
            </Pressable>
            {!!challenge && <>
              <Text style={styles.body} accessibilityLiveRegion="polite">{ui('Revisa tu correo e introduce el código de 8 dígitos. Si no aparece, revisa spam.')}</Text>
              <Text style={styles.label}>{ui('Código de confirmación')}</Text>
              <TextInput value={code} onChangeText={value => setCode(value.replace(/\D/g, '').slice(0,8))} keyboardType="number-pad" autoComplete="one-time-code" textContentType="oneTimeCode" maxLength={8} editable={!busy && !sending} accessibilityLabel={ui('Código de confirmación')} style={styles.input} onSubmitEditing={submit} />
            </>}
          </> : <>
          <Text style={styles.label}>{ui('Confirma tu contraseña')}</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="current-password"
            editable={!busy}
            style={styles.input}
            accessibilityLabel={ui('Confirma tu contraseña')}
            onSubmitEditing={submit}
          />

          </>}
          <Pressable
            style={styles.consentRow}
            onPress={() => setConfirmed((value) => !value)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: confirmed }}
          >
            <View style={[styles.checkbox, confirmed && styles.checkboxActive]}>
              {confirmed && <Ionicons name="checkmark" size={16} color="#000" />}
            </View>
            <Text style={styles.consentText}>{ui('Entiendo que mi cuenta y mis datos se eliminarán de forma permanente.')}</Text>
          </Pressable>

          {!!error && <Text style={styles.error} accessibilityRole="alert" accessibilityLiveRegion="polite">{error}</Text>}

          <Pressable
            style={[styles.deleteButton, !canDelete && styles.disabled]}
            disabled={!canDelete}
            onPress={submit}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canDelete, busy }}
          >
            {busy ? <ActivityIndicator color="#000" /> : <Text style={styles.deleteText}>{ui('ELIMINAR MI CUENTA')}</Text>}
          </Pressable>

          <Pressable style={styles.cancelButton} accessibilityRole="button" onPress={() => router.back()}>
            <Text style={styles.cancelText}>{ui('Cancelar')}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8 },
  backButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, color: '#FFFFFF', fontSize: 18, fontWeight: '800', textAlign: 'center' },
  content: { width: '100%', maxWidth: 640, alignSelf: 'center', paddingHorizontal: 22, paddingBottom: 48 },
  lead: { color: RED, fontSize: 17, fontWeight: '800', marginTop: 8, marginBottom: 12 },
  body: { color: '#E2E2E2', fontSize: 15, lineHeight: 22, marginBottom: 8 },
  listItem: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  bullet: { color: GOLD, fontSize: 15, lineHeight: 22 },
  listText: { flex: 1, color: '#D6D6D6', fontSize: 15, lineHeight: 22 },
  account: { color: '#A6A6A6', fontSize: 14, marginTop: 12 },
  label: { color: '#EAEAEA', fontSize: 14, fontWeight: '700', marginTop: 22, marginBottom: 8 },
  input: { backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#3A3A3A', borderRadius: 12, color: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 14, fontSize: 16 },
  consentRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 14 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: RED, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  checkboxActive: { backgroundColor: RED },
  consentText: { flex: 1, color: '#EAEAEA', fontSize: 14, lineHeight: 20 },
  error: { color: RED, fontSize: 14, lineHeight: 20, marginBottom: 12 },
  deleteButton: { minHeight: 54, borderRadius: 14, backgroundColor: RED, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  disabled: { opacity: 0.45 },
  deleteText: { color: '#000', fontWeight: '800', fontSize: 15 },
  cancelButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  cancelText: { color: GOLD, fontWeight: '700', fontSize: 15 },
});
