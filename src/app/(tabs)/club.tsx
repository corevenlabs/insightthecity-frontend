import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Image, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { experiences, type Experience } from '../../constants/experiences';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const GOLD = '#D4AF37';
const ALL_CATEGORY = '__all__';
const benefits = [
  ['pricetag', 'Ahorros y descuentos', 'en atracciones, restaurantes y más.'],
  ['gift', 'Experiencias exclusivas', 'y giveaways.'],
  ['notifications', 'Alertas de eventos y pop-ups', 'antes que todos.'],
  ['flash', 'City Drops', 'por tiempo limitado.'],
  ['map', 'Guías especiales', 'creadas por expertos locales.'],
  ['star', 'Acceso anticipado', 'a eventos y experiencias.'],
] as const;

function PremiumCard({ experience }: { experience: Experience }) {
  const router = useRouter();
  return (
    <TouchableOpacity
      style={styles.experienceCard}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`Abrir ${experience.title}`}
      onPress={() => router.push({ pathname: '/experience-detail', params: { id: experience.id } })}
    >
      <Image source={{ uri: experience.image }} style={styles.experienceImage} />
      <View style={styles.experienceBody}>
        <View style={styles.experienceTopline}>
          <Text style={styles.category}>{experience.category}</Text>
          <View style={styles.memberBadge}>
            <Ionicons name="star" size={11} color="#050505" />
            <Text style={styles.memberBadgeText}>CLUB</Text>
          </View>
        </View>
        <Text style={styles.experienceTitle}>{experience.title}</Text>
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={15} color={GOLD} />
          <Text style={styles.metaText}>{experience.date}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={15} color={GOLD} />
          <Text style={styles.metaText} numberOfLines={1}>{experience.location}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ClubScreen() {
  const router = useRouter();
  const { user, loading, refreshUser } = useAuth();
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORY);

  useFocusEffect(useCallback(() => { void refreshUser(); }, [refreshUser]));

  const premiumExperiences = useMemo(
    () => experiences.filter((experience) => experience.access === 'premium'), []
  );
  const categories = useMemo(
    () => [ALL_CATEGORY, ...Array.from(new Set(premiumExperiences.map((item) => item.category)))],
    [premiumExperiences]
  );
  const filteredExperiences = useMemo(
    () => selectedCategory === ALL_CATEGORY
      ? premiumExperiences
      : premiumExperiences.filter((item) => item.category === selectedCategory),
    [premiumExperiences, selectedCategory]
  );

  if (!loading && user?.is_premium) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView contentContainerStyle={styles.memberContent} showsVerticalScrollIndicator={false}>
          <View style={styles.memberHeader}>
            <View style={styles.memberIcon}><Ionicons name="star" size={22} color="#050505" /></View>
            <View style={styles.memberHeaderText}>
              <Text style={styles.memberEyebrow}>{t('club.active')}</Text>
              <Text style={styles.memberTitle}>{t('club.exclusiveContent')}</Text>
              <Text style={styles.memberSubtitle}>{t('club.memberSubtitle')}</Text>
            </View>
          </View>

          <Text style={styles.filterLabel}>{t('club.filter')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
            {categories.map((category) => {
              const active = selectedCategory === category;
              return (
                <TouchableOpacity
                  key={category}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  onPress={() => setSelectedCategory(category)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <Text style={[styles.filterText, active && styles.filterTextActive]}>
                    {category === ALL_CATEGORY ? t('club.all') : category}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>{selectedCategory === ALL_CATEGORY ? t('club.allMembers') : selectedCategory}</Text>
            <Text style={styles.resultsCount}>{filteredExperiences.length}</Text>
          </View>
          {filteredExperiences.map((experience) => <PremiumCard key={experience.id} experience={experience} />)}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ImageBackground
        source={{ uri: 'https://img.magnific.com/fotos-premium/vistas-nueva-york-empire-state-building-noche_772417-160.jpg' }}
        style={styles.hero}
      >
        <Text style={styles.header}>ITC <Text style={styles.gold}>CLUB</Text></Text>
        <Text style={styles.subtitle}>{t('club.hero')}</Text>
      </ImageBackground>
      <View style={styles.card}>
        {benefits.map(([icon, title, subtitle], index) => (
          <View key={title} style={[styles.benefitRow, index !== benefits.length - 1 && styles.separator]}>
            <View style={styles.iconContainer}><Ionicons name={icon} size={20} color="#000" /></View>
            <View style={styles.textContainer}>
              <Text style={styles.benefitTitle}>{title}</Text>
              <Text style={styles.benefitSubtitle}>{subtitle}</Text>
            </View>
          </View>
        ))}
        <TouchableOpacity style={styles.joinButton} onPress={() => router.push('/club-form')} accessibilityRole="button">
          <Text style={styles.joinButtonText}>{t('club.join')}</Text>
        </TouchableOpacity>
        <Text style={styles.price}>{t('club.from')} <Text style={styles.priceBold}>$4.99</Text> {t('club.month')}</Text>
        <Text style={styles.cancel}>{t('club.cancel')}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  content: { padding: 20, paddingTop: 60, paddingBottom: 110 },
  hero: { paddingTop: 80, paddingBottom: 60, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  header: { color: '#FFF', fontSize: 46, fontWeight: '900', textAlign: 'center', marginBottom: 12 },
  gold: { color: GOLD },
  subtitle: { color: '#FFF', textAlign: 'center', fontSize: 16, lineHeight: 24, marginBottom: 30, opacity: 0.9 },
  card: { backgroundColor: '#111', borderRadius: 16, borderWidth: 1, borderColor: '#222', padding: 20, marginTop: 20 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  separator: { borderBottomWidth: 1, borderBottomColor: '#222' },
  iconContainer: { width: 44, height: 44, borderRadius: 22, backgroundColor: GOLD, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  textContainer: { flex: 1 },
  benefitTitle: { color: '#FFF', fontSize: 15, fontWeight: '700', marginBottom: 3 },
  benefitSubtitle: { color: '#999', fontSize: 13, lineHeight: 18 },
  joinButton: { minHeight: 54, backgroundColor: GOLD, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 22 },
  joinButtonText: { color: '#000', fontWeight: '700', fontSize: 15 },
  price: { color: '#AAA', textAlign: 'center', marginTop: 16 },
  priceBold: { color: '#FFF', fontWeight: '700' },
  cancel: { color: '#666', fontSize: 12, textAlign: 'center', marginTop: 5 },
  memberContent: { padding: 20, paddingBottom: 120 },
  memberHeader: { flexDirection: 'row', backgroundColor: '#121212', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#3A3115', marginBottom: 28 },
  memberIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  memberHeaderText: { flex: 1 },
  memberEyebrow: { color: GOLD, fontSize: 11, letterSpacing: 1.1, fontWeight: '700', marginBottom: 5 },
  memberTitle: { color: '#FFF', fontSize: 25, fontWeight: '700' },
  memberSubtitle: { color: '#A8A8A8', fontSize: 14, lineHeight: 20, marginTop: 5 },
  filterLabel: { color: '#777', fontSize: 11, letterSpacing: 1.2, fontWeight: '700', marginBottom: 10 },
  filters: { gap: 8, paddingRight: 20, paddingBottom: 4 },
  filterChip: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 17, borderRadius: 22, backgroundColor: '#171717', borderWidth: 1, borderColor: '#292929' },
  filterChipActive: { backgroundColor: GOLD, borderColor: GOLD },
  filterText: { color: '#AAA', fontSize: 12, fontWeight: '600' },
  filterTextActive: { color: '#050505' },
  resultsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 26, marginBottom: 14 },
  resultsTitle: { color: '#FFF', fontSize: 20, fontWeight: '700' },
  resultsCount: { color: '#050505', backgroundColor: GOLD, minWidth: 28, height: 28, textAlign: 'center', lineHeight: 28, borderRadius: 14, fontWeight: '700' },
  experienceCard: { backgroundColor: '#121212', borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: '#242424', marginBottom: 16 },
  experienceImage: { width: '100%', height: 180, backgroundColor: '#1A1A1A' },
  experienceBody: { padding: 16 },
  experienceTopline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  category: { color: GOLD, fontSize: 11, letterSpacing: 1, fontWeight: '700' },
  memberBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: GOLD, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
  memberBadgeText: { color: '#050505', fontSize: 9, fontWeight: '700' },
  experienceTitle: { color: '#FFF', fontSize: 20, lineHeight: 25, fontWeight: '700', marginBottom: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 7, minHeight: 24 },
  metaText: { color: '#A7A7A7', fontSize: 13, flex: 1 },
});
