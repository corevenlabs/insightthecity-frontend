import { ScreenBackButton } from '../../components/ScreenBackButton';
import { Text } from '../../components/typography';
import { ClubLogo } from '../../components/ClubLogo';
import { MemberBenefitBanner } from '../../components/MemberBenefitBanner';
import { MembershipPrice } from '../../components/MembershipPrice';
import { AdaptiveGrid } from '../../components/AdaptiveGrid';
import { MemberBenefitSummary } from '@/components/MemberBenefitSummary';
import { ExperienceTags } from '@/components/ExperienceTags';
import { TagFilter } from '@/components/TagFilter';
import { matchesExperienceTags } from '@/lib/experienceFilters';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Experience } from '../../constants/experiences';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { fetchExperiences } from '../../lib/experiences';
import { fetchPlan, type Plan } from '../../lib/payments';

const GOLD = '#FDDD56';
function PremiumCard({ experience }: { experience: Experience }) {
  const { ui } = useLanguage();
  const router = useRouter();
  return (
    <TouchableOpacity
      style={styles.experienceCard}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={ui('Abrir {title}', { title: experience.title })}
      onPress={() => router.push({ pathname: '/experience-detail', params: { id: experience.id } })}
    >
      <Image source={{ uri: experience.image }} style={styles.experienceImage} />

      <View style={styles.experienceBody}>
        <View style={styles.experienceTopline}>
          <ExperienceTags tags={[experience.region ?? 'NY']} />
          <View style={styles.memberBadge}>
            <Ionicons name="star" size={11} color="#050505" />
            <Text style={styles.memberBadgeText}>CLUB</Text>
          </View>
        </View>
        <Text style={styles.experienceTitle}>{experience.title}</Text>
        <MemberBenefitSummary experience={experience} />
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={15} color={GOLD} />
          <Text style={styles.metaText}>{experience.date}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ClubScreen() {
  const router = useRouter();
  const { user, loading, refreshUser } = useAuth();
  const { t, ui, language, tagLabel } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  // Precio real de Stripe: nunca anunciar un precio distinto al que se cobra.
  const [plan, setPlan] = useState<Plan | null>(null);
  const [planError, setPlanError] = useState(false);
  const [contentError, setContentError] = useState(false);
  const [contentLoading, setContentLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  // Compact preview leaves space for the membership inclusions; larger text can scroll.
  const bannerHeight = 210;

  useFocusEffect(useCallback(() => {
    let active = true;
    // Retry revision intentionally refreshes both panel content and pricing.
    void attempt;
    void refreshUser();
    setContentLoading(true);
    setContentError(false);
    setPlanError(false);
    void fetchExperiences(undefined, language).then(value => { if (active) setExperiences(value); })
      .catch(() => { if (active) setContentError(true); })
      .finally(() => { if (active) setContentLoading(false); });
    void fetchPlan().then(value => { if (active) setPlan(value); }).catch(() => { if (active) setPlanError(true); });
    return () => { active = false; };
  }, [refreshUser, attempt, language]));

  const premiumExperiences = useMemo(
    () => experiences.filter((experience) => experience.access === 'premium'), [experiences]
  );
  const filteredExperiences = useMemo(
    () => premiumExperiences.filter((item) => matchesExperienceTags(item, selectedCategory)),
    [premiumExperiences, selectedCategory]
  );

  if (!loading && user?.is_premium) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.backHeader}><ScreenBackButton /></View>
        <ScrollView contentContainerStyle={styles.memberContent} showsVerticalScrollIndicator={false}>
          <View style={styles.memberHeader}>
            <ClubLogo width={108} header />
            <View style={styles.memberHeaderText}>
              <Text style={styles.memberEyebrow}>{t('club.active').replace(/^ITC\s*CLUB\s*·\s*/i, '')}</Text>
              <Text style={styles.memberTitle}>{t('club.exclusiveContent')}</Text>
              <Text style={styles.memberSubtitle}>{t('club.memberSubtitle')}</Text>
            </View>
          </View>

          <TagFilter items={premiumExperiences} selected={selectedCategory} onChange={setSelectedCategory} />

          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>{selectedCategory.length === 0 ? t('club.allMembers') : selectedCategory.map(tagLabel).join(' · ')}</Text>
            <Text style={styles.resultsCount}>{filteredExperiences.length}</Text>
          </View>
          {filteredExperiences.length === 0 && <Text style={styles.memberSubtitle}>{ui('No hay contenidos con estas etiquetas.')}</Text>}
          <AdaptiveGrid>{filteredExperiences.map((experience) => <PremiumCard key={experience.id} experience={experience} />)}</AdaptiveGrid>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.backHeader}><ScreenBackButton /></View>
    <View style={styles.offerLayout}>
      <ScrollView style={styles.offerPreview} contentContainerStyle={styles.offerPreviewContent} showsVerticalScrollIndicator={false}>
        <View style={styles.offerHero}>
          <ClubLogo width={90} header />
          <Text style={styles.offerSubtitle}>{ui('Descubre New York con beneficios exclusivos')}</Text>
        </View>
        {contentLoading ? <Text style={styles.previewCopy}>{ui('Cargando…')}</Text> : contentError ?
          <TouchableOpacity accessibilityRole="button" style={styles.retryButton} onPress={() => setAttempt(value => value + 1)}><Text style={styles.gold}>{ui('No se pudieron cargar los beneficios. Toca para reintentar.')}</Text></TouchableOpacity> :
          <MemberBenefitBanner height={bannerHeight} items={premiumExperiences.filter(item => Boolean(item.memberBenefit?.trim()) && !['sold_out', 'paused'].includes(item.couponStatus || ''))} />}
        <View style={styles.inclusions}>
          <Text accessibilityRole="header" style={styles.inclusionsTitle}>
            {ui('¿Qué incluye')} ITC <Text style={styles.gold}>CLUB</Text>?
          </Text>
          {[
            'Descuentos y promociones en negocios participantes',
            'Beneficios exclusivos para miembros',
          ].map((benefit) => <View key={benefit} style={styles.inclusionRow}>
            <Ionicons name="checkmark" size={24} color={GOLD} accessible={false} />
            <Text style={styles.inclusionText}>{ui(benefit)}</Text>
          </View>)}
          <Text style={styles.inclusionsNote}>{ui('Entradas y consumos se pagan aparte, salvo que la oferta indique que están incluidos.')}</Text>
        </View>
      <View style={styles.offerFooter}>
        <MembershipPrice compact dense plan={plan} error={planError} retry={() => setAttempt(value => value + 1)} />
        <Text style={styles.offerConditions}>{ui('Beneficios sujetos a disponibilidad y condiciones.')}</Text>
        <TouchableOpacity style={styles.joinButton} onPress={() => router.push('/club-form')} accessibilityRole="button">
          <Text style={styles.joinButtonText}>{ui('CONTINUAR A LA SUSCRIPCIÓN')}</Text>
        </TouchableOpacity>
        <View style={styles.offerLegalLinks}>
          <TouchableOpacity accessibilityRole="link" style={styles.offerTerms} onPress={() => router.push({ pathname: '/legal', params: { slug: 'subscription' } })}>
            <Text style={styles.offerTermsText}>{ui('Términos de la membresía')}</Text>
          </TouchableOpacity>
          <TouchableOpacity accessibilityRole="link" style={styles.offerTerms} onPress={() => router.push({ pathname: '/legal', params: { slug: 'privacy' } })}>
            <Text style={styles.offerTermsText}>{ui('Privacidad')}</Text>
          </TouchableOpacity>
        </View>
      </View>
      </ScrollView>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  inclusions: { marginTop: 22, paddingHorizontal: 4 },
  inclusionsTitle: { color: '#FFF', fontSize: 22, lineHeight: 30, fontWeight: '700', marginBottom: 12 },
  inclusionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 8 },
  inclusionText: { flex: 1, color: '#FFF', fontSize: 15, lineHeight: 23 },
  inclusionsNote: { color: '#AAA', fontSize: 13, lineHeight: 20, marginTop: 12 },
  backHeader: { width: '100%', maxWidth: 680, alignSelf: 'center', paddingHorizontal: 16, paddingTop: 4 },
  offerLayout: { flex: 1, width: '100%', maxWidth: 680, alignSelf: 'center', paddingHorizontal: 16 },
  offerPreview: { flex: 1 },
  offerPreviewContent: { paddingTop: 8, paddingBottom: 16 },
  offerHero: { paddingTop: 16, paddingBottom: 24, paddingHorizontal: 8, alignItems: 'center' },
  offerLogo: { color: '#FFF', fontSize: 30, fontWeight: '900', lineHeight: 36 },
  offerSubtitle: { color: '#FFF', fontSize: 14, lineHeight: 20, textAlign: 'center', marginTop: 8, fontWeight: '600' },
  offerFooter: { marginTop: 16, paddingHorizontal: 16, paddingTop: 16, backgroundColor: '#111', borderWidth: 1, borderColor: '#282828', borderRadius: 18 },
  offerFooterDetails: { flexGrow: 0, flexShrink: 1 },
  offerConditions: { color: '#AAA', fontSize: 12, lineHeight: 17, marginBottom: 3, textAlign: 'center' },
  offerLegalLinks: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', columnGap: 16 },
  offerTerms: { minHeight: 48, alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
  offerTermsText: { color: GOLD, fontSize: 12, lineHeight: 17, textAlign: 'center' },
  screenTitle: { color: '#FFF', fontSize: 17, fontWeight: '700', textAlign: 'center', paddingVertical: 12, marginBottom: 4 },
  previewHeading: { color: '#FFF', fontSize: 23, fontWeight: '800', marginTop: 24, marginBottom: 10 },
  previewCopy: { color: '#BBB', fontSize: 14, lineHeight: 22, marginBottom: 16 },
  retryButton: { minHeight: 44, justifyContent: 'center', paddingVertical: 12 },
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  content: { width: '100%', maxWidth: 680, alignSelf: 'center', padding: 20, paddingTop: 8, paddingBottom: 110 },
  hero: { minHeight: 138, paddingVertical: 24, paddingHorizontal: 12, marginBottom: 16, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: 16 },
  header: { color: '#FFF', fontSize: 34, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  gold: { color: GOLD },
  subtitle: { color: '#FFF', textAlign: 'center', fontSize: 15, lineHeight: 22, fontWeight: '600' },
  card: { backgroundColor: '#111', borderRadius: 16, borderWidth: 1, borderColor: '#222', padding: 18, marginTop: 10 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  separator: { borderBottomWidth: 1, borderBottomColor: '#222' },
  iconContainer: { width: 44, height: 44, borderRadius: 22, backgroundColor: GOLD, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  textContainer: { flex: 1 },
  benefitTitle: { color: '#FFF', fontSize: 15, fontWeight: '700', marginBottom: 3 },
  benefitSubtitle: { color: '#999', fontSize: 13, lineHeight: 18 },
  joinButton: { minHeight: 52, paddingVertical: 12, paddingHorizontal: 8, backgroundColor: GOLD, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  joinButtonText: { color: '#000', fontWeight: '700', fontSize: 13, textAlign: 'center' },
  price: { color: '#AAA', textAlign: 'center', marginTop: 16 },
  priceBold: { color: '#FFF', fontWeight: '700' },
  cancel: { color: '#A6A6A6', fontSize: 12, textAlign: 'center', marginTop: 5 },
  memberContent: { padding: 20, paddingBottom: 120 },
  memberHeader: { flexDirection: 'column', gap: 12, backgroundColor: '#121212', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#3A3115', marginBottom: 28 },
  memberLogo: { color: '#FFFFFF', fontSize: 24, lineHeight: 30, fontWeight: '800', letterSpacing: -0.8 },
  memberHeaderText: { flex: 1 },
  memberEyebrow: { color: GOLD, fontSize: 11, letterSpacing: 1.1, fontWeight: '700', marginBottom: 5 },
  memberTitle: { color: '#FFF', fontSize: 25, fontWeight: '700' },
  memberSubtitle: { color: '#A8A8A8', fontSize: 14, lineHeight: 20, marginTop: 5 },
  filterLabel: { color: '#A6A6A6', fontSize: 11, letterSpacing: 1.2, fontWeight: '700', marginBottom: 10 },
  filters: { gap: 8, paddingRight: 20, paddingBottom: 4 },
  filterChip: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 17, borderRadius: 22, backgroundColor: '#171717', borderWidth: 1, borderColor: '#292929' },
  filterChipActive: { backgroundColor: GOLD, borderColor: GOLD },
  filterText: { color: '#AAA', fontSize: 12, fontWeight: '600' },
  filterTextActive: { color: '#050505' },
  resultsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 26, marginBottom: 14 },
  resultsTitle: { color: '#FFF', fontSize: 20, fontWeight: '700' },
  resultsCount: { color: '#050505', backgroundColor: GOLD, minWidth: 28, height: 28, textAlign: 'center', lineHeight: 28, borderRadius: 14, fontWeight: '700' },
  experienceCard: { backgroundColor: '#121212', borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: '#242424', marginBottom: 16 },
  experienceImage: { width: '100%', aspectRatio: 1.8, backgroundColor: '#1A1A1A' },
  experienceBody: { padding: 16 },
  experienceTopline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  category: { color: GOLD, fontSize: 11, letterSpacing: 1, fontWeight: '700' },
  memberBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: GOLD, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
  memberBadgeText: { color: '#050505', fontSize: 9, fontWeight: '700' },
  experienceTitle: { color: '#FFF', fontSize: 20, lineHeight: 25, fontWeight: '700', marginBottom: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 7, minHeight: 24 },
  metaText: { color: '#A7A7A7', fontSize: 13, flex: 1 },
});
