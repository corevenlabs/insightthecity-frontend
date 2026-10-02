import { useLanguage } from '@/context/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { confirmSubscription } from '../lib/payments';

type Status = 'confirming' | 'active' | 'pending';

// El premium solo se activa cuando el backend verifica la sesión de pago con Stripe.
export default function SuccessScreen() {
  const { ui } = useLanguage();
  const { token, applyServerUser, refreshUser } = useAuth();
  const params = useLocalSearchParams<{ session_id?: string }>();
  const sessionId = Array.isArray(params.session_id) ? params.session_id[0] : params.session_id;
  const [status, setStatus] = useState<Status>('confirming');
  const [scaleAnim] = useState(() => new Animated.Value(0));
  const [fadeAnim] = useState(() => new Animated.Value(0));
  const started = useRef(false);

  useEffect(() => {
    if (started.current || !token) return;
    started.current = true;
    (async () => {
      // Stripe puede tardar unos segundos en marcar la sesión como completa.
      for (let attempt = 0; attempt < 5; attempt += 1) {
        try {
          if (sessionId) {
            const user = await confirmSubscription(token, sessionId);
            await applyServerUser(user);
            if (user.is_premium) return setStatus('active');
          } else {
            const user = await refreshUser();
            if (user?.is_premium) return setStatus('active');
          }
        } catch {
          // reintenta
        }
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
      setStatus('pending');
    })();
  }, [token, sessionId, applyServerUser, refreshUser]);

  useEffect(() => {
    if (status === 'confirming') return;
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 5, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, delay: 200, useNativeDriver: true }),
    ]).start();
  }, [status, fadeAnim, scaleAnim]);

  if (status === 'confirming') {
    return (
      <View style={styles.container}>
        <ActivityIndicator color="#D4AF37" size="large" />
        <Text style={[styles.subtitle, { marginTop: 24 }]} accessibilityLiveRegion="polite">
          {ui('Confirmando tu pago con Stripe…')}
        </Text>
      </View>
    );
  }

  const active = status === 'active';
  return (
    <View style={styles.container}>
      <Animated.View style={[styles.iconContainer, { transform: [{ scale: scaleAnim }] }]}>
        <Ionicons name={active ? 'checkmark-circle' : 'time-outline'} size={100} color="#D4AF37" accessible={false} />
      </Animated.View>
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={styles.title} accessibilityRole="header">
          {active ? ui('¡Bienvenido al Club!') : ui('Estamos confirmando tu pago')}
        </Text>
        <Text style={styles.subtitle}>
          {active
            ? ui('Tu membresía está activa. Te enviamos un correo con los términos de renovación y cómo cancelar.')
            : ui('Tu pago aún no aparece como confirmado. Si se completó, tu membresía se activará en unos minutos; revisa Perfil > Mi membresía.')}
        </Text>
      </Animated.View>
      <Animated.View style={[styles.buttonContainer, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace(active ? '/club' : '/profile')}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>{active ? ui('VER CONTENIDO ITC CLUB') : ui('IR A MI PERFIL')}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center', padding: 30 },
  iconContainer: { marginBottom: 30 },
  title: { color: '#D4AF37', fontSize: 28, fontWeight: '700', textAlign: 'center', marginBottom: 16 },
  subtitle: { color: '#C4C4C4', fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 50 },
  buttonContainer: { width: '100%' },
  button: { minHeight: 54, backgroundColor: '#D4AF37', borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#000', fontWeight: '700', fontSize: 15 },
});
