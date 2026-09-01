import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useAuth } from '../context/AuthContext';

export default function SuccessScreen() {
  const { user, activatePremiumForDevelopment } = useAuth();
  const [scaleAnim] = useState(() => new Animated.Value(0));
  const [fadeAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 5, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, delay: 300, useNativeDriver: true }),
    ]).start();

    void activatePremiumForDevelopment();
  }, [activatePremiumForDevelopment, fadeAnim, scaleAnim]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.iconContainer, { transform: [{ scale: scaleAnim }] }]}>
        <Ionicons name="checkmark-circle" size={100} color="#D4AF37" />
      </Animated.View>
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={styles.title}>¡Bienvenido al Club!</Text>
        <Text style={styles.subtitle}>
          {user?.is_premium
            ? 'Tu membresía está activa. Ya puedes explorar todo el contenido exclusivo.'
            : 'Recibimos tu pago y estamos preparando tu contenido exclusivo.'}
        </Text>
      </Animated.View>
      <Animated.View style={[styles.buttonContainer, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.button} onPress={() => router.replace('/club')} accessibilityRole="button">
          <Text style={styles.buttonText}>VER CONTENIDO ITC CLUB</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center', padding: 30 },
  iconContainer: { marginBottom: 30 },
  title: { color: '#D4AF37', fontSize: 28, fontWeight: '700', textAlign: 'center', marginBottom: 16 },
  subtitle: { color: '#AAA', fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 50 },
  buttonContainer: { width: '100%' },
  button: { minHeight: 54, backgroundColor: '#D4AF37', borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#000', fontWeight: '700', fontSize: 15 },
});
