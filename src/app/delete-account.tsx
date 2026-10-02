import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const GOLD = '#D4AF37';
const RED = '#FF8080';

// Eliminación de cuenta desde la app (App Store 5.1.1(v) / Google Play).
// Borra la cuenta y los datos personales y cancela la membresía de Stripe.
export default function DeleteAccountScreen() {
  const { ui } = useLanguage();
  const { user, deleteAccount } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const canDelete = confirmed && password.length > 0 && !busy;

  const submit = async () => {
    if (!canDelete) return;
    setBusy(true);
    setError('');
    try {
      await deleteAccount(password);
      router.dismissAll();
      router.replace('/welcome');
    } catch (err) {
      setError(err instanceof Error ? err.message : ui('No se pudo eliminar la cuenta.'));
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
            ui('Si tienes una membresía ITC Club, la cancelamos de inmediato y no se te volverá a cobrar.'),
            ui('Pierdes el acceso a las guías que compraste.'),
            ui('Stripe puede conservar el registro de tus pagos por obligaciones legales y fiscales.'),
          ].map((item) => (
            <View key={item} style={styles.listItem}>
              <Text style={styles.bullet} accessible={false}>•</Text>
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}

          {user?.email ? <Text style={styles.account}>{ui('Cuenta: {email}', { email: user.email })}</Text> : null}

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
  content: { paddingHorizontal: 22, paddingBottom: 48 },
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
