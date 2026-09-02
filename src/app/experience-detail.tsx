import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getExperienceById } from '@/constants/experiences';
import { useAuth } from '../context/AuthContext';
import type { Experience } from '../constants/experiences';
import { fetchExperience } from '../lib/experiences';

export default function ExperienceDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { user } = useAuth();
  const [experience, setExperience] = useState<Experience | undefined>(() => getExperienceById(id));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!id) { setLoading(false); return; }
    fetchExperience(id)
      .then((item) => { if (active) setExperience(item); })
      .catch(() => undefined)
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  if (loading && !experience) {
    return <SafeAreaView style={styles.container}><View style={styles.emptyState}><Text style={styles.emptyTitle}>Actualizando contenido…</Text></View></SafeAreaView>;
  }

  if (!experience) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Contenido no disponible</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.back()}>
            <Text style={styles.primaryButtonText}>VOLVER</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const requiresPremium = experience.access === 'premium';
  const isLocked = requiresPremium && !user?.is_premium;
  const isPaidEvent = Boolean(experience.isPaidEvent && experience.ticketUrl);
  const ticketCta = experience.ticketCta?.trim() || 'COMPRAR BOLETOS';
  const isCtaEnabled = isPaidEvent || isLocked;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Image source={{ uri: experience.image }} style={styles.heroImage} />
          <View style={styles.heroOverlay}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.heroText}>
              <Text style={styles.category}>{experience.category}</Text>
              <Text style={styles.title}>{experience.title}</Text>
            </View>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaPill}>
            <Ionicons name="calendar-outline" size={15} color="#D4AF37" />
            <Text style={styles.metaText}>{experience.date}</Text>
          </View>
          <View style={styles.metaPill}>
            <Ionicons name="location-outline" size={15} color="#D4AF37" />
            <Text style={styles.metaText}>{experience.location}</Text>
          </View>
        </View>

        <View style={[styles.accessBadge, !isPaidEvent && isLocked ? styles.premiumBadge : styles.freeBadge]}>
          <Ionicons
            name={isPaidEvent ? 'ticket-outline' : isLocked ? 'lock-closed' : requiresPremium ? 'lock-open' : 'gift-outline'}
            size={15}
            color={!isPaidEvent && isLocked ? '#D4AF37' : '#050505'}
          />
          <Text style={[styles.accessText, !isPaidEvent && isLocked && styles.premiumText]}>
            {isPaidEvent
              ? 'Evento con entrada de pago'
              : isLocked
              ? 'Premium ITC Club'
              : requiresPremium
                ? 'Incluido en tu membresía'
                : 'Beneficio gratis'}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Descripción</Text>
        <Text style={styles.description}>{experience.description}</Text>

        <Text style={styles.sectionTitle}>Qué incluye</Text>
        {experience.includes.map((item) => (
          <View key={item} style={styles.includeRow}>
            <Ionicons name="checkmark-circle" size={18} color="#D4AF37" />
            <Text style={styles.includeText}>{item}</Text>
          </View>
        ))}

        <View style={styles.recommendationCard}>
          <Text style={styles.recommendationLabel}>Recomendación ITC</Text>
          <Text style={styles.recommendationText}>{experience.recommendation}</Text>
        </View>

        <TouchableOpacity
          style={[styles.ctaButton, !isPaidEvent && isLocked && styles.lockedButton]}
          onPress={() => {
            if (isPaidEvent && experience.ticketUrl) {
              void WebBrowser.openBrowserAsync(experience.ticketUrl);
            } else if (isLocked) {
              router.push('/club-form');
            }
          }}
          disabled={!isCtaEnabled}
          accessibilityRole="button"
          accessibilityLabel={isPaidEvent ? `${ticketCta}: ${experience.title}` : undefined}
          accessibilityHint={isPaidEvent ? 'Abre el sitio de compra de boletos' : undefined}
          accessibilityState={{ disabled: !isCtaEnabled }}
        >
          <Ionicons
            name={isPaidEvent ? 'ticket-outline' : isLocked ? 'lock-closed' : requiresPremium ? 'checkmark-circle' : 'gift-outline'}
            size={18}
            color={!isPaidEvent && isLocked ? '#D4AF37' : '#050505'}
          />
          <Text style={[styles.ctaText, !isPaidEvent && isLocked && styles.lockedText]}>
            {isPaidEvent
              ? ticketCta.toUpperCase()
              : isLocked
              ? 'SUSCRÍBETE PARA DESBLOQUEAR'
              : requiresPremium
                ? 'BENEFICIO DESBLOQUEADO'
                : 'BENEFICIO DISPONIBLE'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 70 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const COLORS = {
  background: '#050505',
  card: '#121212',
  gold: '#D4AF37',
  white: '#FFFFFF',
  secondary: '#A6A6A6',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingBottom: 120,
  },
  hero: {
    height: 360,
    backgroundColor: COLORS.card,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  heroOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.52)',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: {
    paddingBottom: 8,
  },
  category: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 8,
  },
  title: {
    color: COLORS.white,
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 40,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 18,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: COLORS.card,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#222',
  },
  metaText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
  accessBadge: {
    marginHorizontal: 20,
    marginTop: 16,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  freeBadge: {
    backgroundColor: COLORS.gold,
  },
  premiumBadge: {
    backgroundColor: '#151515',
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  accessText: {
    color: COLORS.background,
    fontWeight: '900',
    fontSize: 12,
  },
  premiumText: {
    color: COLORS.gold,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '800',
    marginHorizontal: 20,
    marginTop: 26,
    marginBottom: 10,
  },
  description: {
    color: COLORS.secondary,
    fontSize: 15,
    lineHeight: 23,
    marginHorizontal: 20,
  },
  includeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  includeText: {
    color: COLORS.white,
    flex: 1,
    lineHeight: 20,
  },
  recommendationCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#222',
  },
  recommendationLabel: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 8,
  },
  recommendationText: {
    color: COLORS.white,
    lineHeight: 22,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.gold,
    borderRadius: 14,
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 18,
  },
  lockedButton: {
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  ctaText: {
    color: COLORS.background,
    fontSize: 14,
    fontWeight: '900',
  },
  lockedText: {
    color: COLORS.gold,
  },
  primaryButton: {
    backgroundColor: COLORS.gold,
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginTop: 20,
  },
  primaryButtonText: {
    color: COLORS.background,
    fontWeight: '900',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '800',
  },
});
