import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
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
  const logoSwap = useRef(new Animated.Value(0)).current;
  const content = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(content, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.delay(900),
        Animated.timing(logoSwap, {
          toValue: 1,
          duration: 720,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.delay(1250),
        Animated.timing(logoSwap, {
          toValue: 0,
          duration: 720,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.delay(1250),
      ])
    ).start();

  }, [content, logoSwap]);

  const contentTranslate = content.interpolate({
    inputRange: [0, 1],
    outputRange: [28, 0],
  });

  const monogramOpacity = logoSwap.interpolate({
    inputRange: [0, 0.45, 1],
    outputRange: [1, 0, 0],
  });

  const fullLogoOpacity = logoSwap.interpolate({
    inputRange: [0, 0.55, 1],
    outputRange: [0, 0, 1],
  });

  const monogramScale = logoSwap.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.9],
  });

  const fullLogoScale = logoSwap.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoSection}>
        <View style={styles.logoWrap}>
          <Animated.View
            style={[
              styles.logoLayer,
              {
                opacity: monogramOpacity,
                transform: [{ scale: monogramScale }],
              },
            ]}
          >
            <Text style={styles.clubLogo}>
              <Text style={styles.clubLogoWhite}>ITC </Text>
              <Text style={styles.clubLogoGold}>CLUB</Text>
            </Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.logoLayer,
              {
                opacity: fullLogoOpacity,
                transform: [{ scale: fullLogoScale }],
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
    width: 260,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLayer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clubLogo: {
    fontSize: 54,
    fontWeight: '900',
    letterSpacing: 0,
  },
  clubLogoWhite: {
    color: '#FFFFFF',
  },
  clubLogoGold: {
    color: GOLD,
  },
  insight: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 0,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -2,
  },
  cityText: {
    color: GOLD,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 5,
  },
  divider: {
    width: 3,
    height: 25,
    marginHorizontal: 8,
    backgroundColor: GOLD,
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
