import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  AccessibilityInfo,
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
  const [reduceMotion, setReduceMotion] = useState(false);
  const [logoReveal] = useState(() => new Animated.Value(0));
  const [logoPulse] = useState(() => new Animated.Value(0));
  const [content] = useState(() => new Animated.Value(0));

  useEffect(() => {
    let pulseAnimation: Animated.CompositeAnimation | undefined;

    const startAnimations = async () => {
      const shouldReduceMotion = await AccessibilityInfo.isReduceMotionEnabled();
      setReduceMotion(shouldReduceMotion);

      if (shouldReduceMotion) {
        logoReveal.setValue(1);
        content.setValue(1);
        return;
      }

      Animated.parallel([
        Animated.timing(logoReveal, {
          toValue: 1,
          duration: 900,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(content, {
          toValue: 1,
          duration: 700,
          delay: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        pulseAnimation = Animated.loop(
          Animated.sequence([
            Animated.delay(1400),
            Animated.timing(logoPulse, {
              toValue: 1,
              duration: 1600,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(logoPulse, {
              toValue: 0,
              duration: 1600,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        );
        pulseAnimation.start();
      });
    };

    startAnimations();

    return () => pulseAnimation?.stop();
  }, [content, logoPulse, logoReveal]);

  const contentTranslate = content.interpolate({
    inputRange: [0, 1],
    outputRange: [28, 0],
  });

  const logoTranslate = logoReveal.interpolate({
    inputRange: [0, 1],
    outputRange: [18, 0],
  });

  const logoScale = logoReveal.interpolate({
    inputRange: [0, 1],
    outputRange: [0.94, 1],
  });

  const pulseScale = logoPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.018],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoSection}>
        <Animated.View
          accessible
          accessibilityRole="image"
          accessibilityLabel="Insight The City"
          style={[
            styles.logoWrap,
            {
              opacity: logoReveal,
              transform: [
                { translateY: logoTranslate },
                { scale: reduceMotion ? 1 : Animated.multiply(logoScale, pulseScale) },
              ],
            },
          ]}
        >
          <Text style={styles.insight}>INSIGHT</Text>
          <View style={styles.cityRow}>
            <Text style={styles.cityText}>THE</Text>
            <View style={styles.divider} />
            <Text style={styles.cityText}>CITY</Text>
          </View>
        </Animated.View>
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
    paddingHorizontal: 24,
  },
  logoWrap: {
    width: 310,
    minHeight: 118,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insight: {
    color: '#FFFFFF',
    fontFamily: 'SplineSans_700Bold',
    fontSize: 53,
    lineHeight: 58,
    letterSpacing: -1.4,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -10,
  },
  cityText: {
    color: '#FFFFFF',
    fontFamily: 'SplineSans_700Bold',
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: 4.5,
  },
  divider: {
    width: 4,
    height: 40,
    marginHorizontal: 10,
    backgroundColor: '#FFFFFF',
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
