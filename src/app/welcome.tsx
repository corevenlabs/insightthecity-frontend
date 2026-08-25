import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const GOLD = '#D4AF37';
const BLACK = '#050505';

export default function WelcomeScreen() {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [content] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(content, {
      toValue: 1,
      duration: 700,
      delay: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [content]);

  const contentTranslate = content.interpolate({
    inputRange: [0, 1],
    outputRange: [28, 0],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoSection}>
        <Image
          source={require('@/assets/images/itc-login-logo.gif')}
          style={styles.animatedLogo}
          contentFit="cover"
          transition={0}
          accessibilityRole="image"
          accessibilityLabel="Insight The City"
        />
      </View>

      <Animated.View
        style={[
          styles.actionPanel,
          {
            opacity: content,
            transform: [{ translateY: contentTranslate }],
          },
        ]}
      >
        <View style={styles.kickerRow}>
          <Ionicons name="sparkles" size={16} color={GOLD} />
          <Text style={styles.kicker}>NYC & NJ GUIDE</Text>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.86}
          onPress={() => router.push('/login' as any)}
        >
          <Text style={styles.primaryText}>INICIAR SESIÓN</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          activeOpacity={0.86}
          onPress={() => router.push('/register' as any)}
        >
          <Text style={styles.secondaryText}>CREAR CUENTA</Text>
        </TouchableOpacity>

        <Pressable
          style={styles.termsRow}
          onPress={() => setAcceptedTerms((value) => !value)}
        >
          <View style={[styles.checkbox, acceptedTerms && styles.checkboxActive]}>
            {acceptedTerms && <Ionicons name="checkmark" size={14} color={BLACK} />}
          </View>
          <Text style={styles.termsText}>
            Acepto términos y condiciones
          </Text>
        </Pressable>

        <Pressable onPress={() => router.replace('/home' as any)}>
          <Text style={styles.guestText}>Continuar como invitado</Text>
        </Pressable>

        <Text style={styles.subtitle}>
          Eventos, drops, guías y experiencias seleccionadas para vivir la ciudad
          con estilo.
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BLACK,
  },
  logoSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  animatedLogo: {
    width: '100%',
    height: '100%',
  },
  actionPanel: {
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  kickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 18,
  },
  kicker: {
    color: GOLD,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
  },
  primaryButton: {
    backgroundColor: GOLD,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  primaryText: {
    color: BLACK,
    fontSize: 15,
    fontWeight: '900',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryText: {
    color: GOLD,
    fontSize: 15,
    fontWeight: '900',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 18,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: GOLD,
  },
  termsText: {
    color: '#B8B8B8',
    fontSize: 13,
    fontWeight: '700',
  },
  guestText: {
    color: GOLD,
    textAlign: 'center',
    marginTop: 18,
    fontWeight: '800',
  },
  subtitle: {
    color: '#8E8E8E',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 18,
    textAlign: 'center',
  },
});
