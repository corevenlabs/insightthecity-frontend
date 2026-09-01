import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../context/AuthContext';

const GOLD = '#D4AF37';
const BLACK = '#050505';

export function BiometricLockScreen() {
  const pathname = usePathname();
  const { biometricAvailable, biometricLabel, biometricLocked, loading, unlockWithBiometrics } =
    useAuth();
  const [unlocking, setUnlocking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // En login dejamos disponibles las dos alternativas solicitadas.
  if (loading || !biometricLocked || pathname === '/login') return null;

  const unlock = async () => {
    if (unlocking || !biometricAvailable) return;
    setUnlocking(true);
    setError(null);
    try {
      await unlockWithBiometrics();
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo desbloquear la sesión.');
    } finally {
      setUnlocking(false);
    }
  };

  return (
    <SafeAreaView style={styles.overlay} accessibilityViewIsModal>
      <View style={styles.content}>
        <View style={styles.iconCircle} accessible={false}>
          <Ionicons name="scan-outline" size={42} color={GOLD} />
        </View>
        <Text style={styles.eyebrow}>SESIÓN PROTEGIDA</Text>
        <Text style={styles.title}>Desbloquea Insight The City</Text>
        <Text style={styles.subtitle}>
          {biometricAvailable
            ? `Confirma tu identidad con ${biometricLabel} para continuar donde estabas.`
            : 'La biometría no está disponible. Ingresa nuevamente con tu contraseña.'}
        </Text>

        {error && (
          <Text style={styles.error} accessibilityRole="alert">
            {error}
          </Text>
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Ingresar con ${biometricLabel}`}
          disabled={unlocking || !biometricAvailable}
          onPress={unlock}
          style={({ pressed }) => [
            styles.primaryButton,
            (pressed || unlocking) && styles.buttonPressed,
            !biometricAvailable && styles.buttonDisabled,
          ]}
        >
          {unlocking ? (
            <ActivityIndicator color={BLACK} />
          ) : (
            <>
              <Ionicons name="scan-outline" size={22} color={BLACK} />
              <Text style={styles.primaryText}>INGRESAR CON {biometricLabel.toUpperCase()}</Text>
            </>
          )}
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/login' as any)}
          style={({ pressed }) => [styles.passwordButton, pressed && styles.buttonPressed]}
        >
          <Text style={styles.passwordText}>Usar correo y contraseña</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 2000,
    backgroundColor: BLACK,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  content: { width: '100%', maxWidth: 440, alignItems: 'center' },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1,
    borderColor: '#4A3E14',
    backgroundColor: '#171305',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  eyebrow: { color: GOLD, fontSize: 12, fontWeight: '800', letterSpacing: 2, marginBottom: 12 },
  title: { color: '#FFFFFF', fontSize: 30, lineHeight: 36, fontWeight: '900', textAlign: 'center' },
  subtitle: {
    color: '#B8B8B8',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 28,
  },
  error: { color: '#FF8A8A', fontSize: 14, lineHeight: 20, textAlign: 'center', marginBottom: 16 },
  primaryButton: {
    minHeight: 56,
    width: '100%',
    borderRadius: 14,
    backgroundColor: GOLD,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  primaryText: { color: BLACK, fontSize: 14, fontWeight: '900' },
  passwordButton: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 16, marginTop: 12 },
  passwordText: { color: GOLD, fontSize: 15, fontWeight: '800' },
  buttonPressed: { opacity: 0.72 },
  buttonDisabled: { opacity: 0.45 },
});
