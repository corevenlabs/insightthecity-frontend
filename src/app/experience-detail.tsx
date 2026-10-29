import { formatBenefitCountdown, useBenefitSchedule } from '../lib/benefitSchedule';
import { ExperienceSocialLinks } from '../components/ExperienceSocialLinks';
import { ExperienceLocation } from '../components/ExperienceLocation';
import { eventMapsUrl } from '../lib/experienceLocation';
import { Text } from '../components/typography';
import { partnerDisclosure } from '../lib/partnerDisclosure';
import { ClubLogo } from '../components/ClubLogo';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { SaveButton } from '../components/SaveButton';
import { savedExperience } from '../context/SavedContext';
import { useLanguage } from '@/context/LanguageContext';
import { ExperienceTags } from '@/components/ExperienceTags';
import { getExperienceTags } from '@/lib/experienceFilters';
import { ExpandableSection, ExpandableText } from '@/components/ExpandableContent';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, FlatList, Image, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import type { Experience } from '../constants/experiences';
import { fetchExperience } from '../lib/experiences';
import { issueBenefitCode, useBenefitReservation, qrUnavailable, type BenefitCode } from '../lib/benefits';

export default function ExperienceDetailScreen() {
  const { ui, language } = useLanguage();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { user, token } = useAuth();
  const [experience, setExperience] = useState<Experience | undefined>(undefined);
  // Se guarda para qué id se cargó / qué foto se ve: al cambiar de experiencia
  // el estado anterior deja de aplicar sin tener que resetearlo en un efecto.
  const [loadedId, setLoadedId] = useState<string | undefined>(undefined);
  const [photo, setPhoto] = useState<{ id?: string; index: number }>({ id, index: 0 });
  const refreshing = Boolean(id) && loadedId !== `${id}:${language}`;
  const loading = refreshing && experience?.id !== id;
  const [contentError, setContentError] = useState(false);
  const requestScope = `${id}:${token || ''}`;
  const currentScope = useRef(requestScope);
  const photoIndex = photo.id === id ? photo.index : 0;
  const [benefitCode, setBenefitCode] = useState<(BenefitCode & { scope: string }) | null>(null);
  const hasReservation = useBenefitReservation(experience?.id === id && experience?.benefitAction === 'qr' && user?.is_premium ? id : undefined, token, benefitCode?.reference);
  const [benefitLoading, setBenefitLoading] = useState(false);
  const [benefitError, setBenefitError] = useState('');
  const [scheduleRevision, setScheduleRevision] = useState(0);
  const refreshSchedule = useCallback(() => setScheduleRevision(value => value + 1), []);
  const schedule = useBenefitSchedule(experience?.id === id ? experience : undefined, refreshSchedule);
  const visibleCode = benefitCode?.scope === requestScope && !schedule.blocked ? benefitCode : null;
  const [heroTextLayout, setHeroTextLayout] = useState<{ key: string; height: number } | null>(null);
  const { width: availableWidth, height: screenHeight, fontScale = 1 } = useResponsiveLayout();
  const screenWidth = Math.min(availableWidth, 860);
  const heroLayoutKey = `${id}:${language}:${screenWidth}:${fontScale}`;
  const measuredTextHeight = heroTextLayout?.key === heroLayoutKey ? heroTextLayout.height : 0;
  const baseHeroHeight = Math.min(480, Math.max(220, Math.min(screenWidth * 0.8, screenHeight * 0.6)));
  // Preserve the existing photo size; grow only when the actual text needs more room.
  const heroHeight = Math.max(baseHeroHeight, measuredTextHeight + 100);

  useEffect(() => {
    currentScope.current = requestScope;
    return () => { currentScope.current = ''; };
  }, [requestScope]);

  useEffect(() => {
    let active = true;
    if (!id) return;
    fetchExperience(id, language)
      .then((item) => { if (active) { setExperience(item); setContentError(false); } })
      .catch(() => { if (active) setContentError(true); })
      .finally(() => { if (active) setLoadedId(`${id}:${language}`); });
    return () => { active = false; };
  }, [id, language, scheduleRevision]);

  if (loading) {
    return <SafeAreaView style={styles.container}><View style={styles.emptyState}><Text style={styles.emptyTitle}>{ui("Actualizando contenido…")}</Text></View></SafeAreaView>;
  }

  if (!experience || experience.id !== id) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>{ui("Contenido no disponible")}</Text>
          <TouchableOpacity accessibilityRole="button" style={styles.primaryButton} onPress={() => router.back()}>
            <Text style={styles.primaryButtonText}>{ui("VOLVER")}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const summary = experience.cardDescription?.trim();
  const requiresPremium = experience.access === 'premium';
  const isLocked = requiresPremium && !user?.is_premium;
  const isPaidEvent = Boolean(experience.isPaidEvent && experience.ticketUrl);
  const ticketCta = ui(experience.ticketCta?.trim() || '') || ui("COMPRAR BOLETOS");
  const benefitAction = experience.benefitAction || 'none';
  const disclosure = requiresPremium ? partnerDisclosure(experience.partnerOffer, isPaidEvent || (benefitAction === 'external' && Boolean(experience.benefitUrl))) : null;
  const scheduledQr = !isPaidEvent && benefitAction === 'qr' && (schedule.phase === 'scheduled' || schedule.phase === 'checking');
  const couponUnavailable = benefitAction === 'qr' && (schedule.blocked || qrUnavailable(experience.couponStatus, Boolean(hasReservation)));
  const hasBenefitAction = requiresPremium && !isLocked && !couponUnavailable && (benefitAction === 'qr' || (benefitAction === 'external' && Boolean(experience.benefitUrl)));
  const benefitCta = ui(experience.benefitCta?.trim() || '') || ui('OBTENER BENEFICIO');
  const isCtaEnabled = !scheduledQr && (isPaidEvent || isLocked || hasBenefitAction);
  const photos = requiresPremium && experience.images?.length ? experience.images : [experience.image];

  async function handleCta() {
    if (!isCtaEnabled || benefitLoading) return;
    if (isPaidEvent && experience?.ticketUrl) return void WebBrowser.openBrowserAsync(experience.ticketUrl);
    if (isLocked) return router.push('/club-form');
    if (benefitAction === 'external' && experience?.benefitUrl) return void WebBrowser.openBrowserAsync(experience.benefitUrl);
    if (benefitAction === 'qr' && experience && token) {
      setBenefitLoading(true);
      setBenefitError('');
      try {
        const code = await issueBenefitCode(experience.id, token);
        if (currentScope.current === requestScope) setBenefitCode({ ...code, scope: requestScope });
      }
      catch (error) { if (currentScope.current === requestScope) setBenefitError(ui(error instanceof Error ? error.message : 'No se pudo generar el código.')); }
      finally { setBenefitLoading(false); }
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {contentError && <Text style={styles.ctaError} accessibilityRole="alert">{ui('No se pudo actualizar el contenido. Revisa tu conexión.')}</Text>}
        <View style={[styles.hero, { height: heroHeight }]}>
          <FlatList
            key={`${screenWidth}`}
            data={photos}
            initialScrollIndex={Math.min(photoIndex, photos.length - 1)}
            getItemLayout={(_, index) => ({ length: screenWidth, offset: screenWidth * index, index })}
            horizontal
            pagingEnabled
            scrollEnabled={requiresPremium && photos.length > 1}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(url, index) => `${index}-${url}`}
            renderItem={({ item }) => <Image source={{ uri: item }} style={[styles.heroImage, { width: screenWidth, height: heroHeight }]} />}
            onMomentumScrollEnd={(event) => setPhoto({ id, index: Math.round(event.nativeEvent.contentOffset.x / screenWidth) })}
          />
          {summary ? <LinearGradient
            colors={['rgba(0,0,0,0.12)', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.92)']}
            locations={[0, 0.4, 1]}
            style={styles.heroGradient}
            pointerEvents="none"
          /> : <View style={styles.heroShade} pointerEvents="none" />}
          {!['ny_al_dia'].includes(experience.section || '') && <SaveButton item={savedExperience(experience)} />}
          <View style={styles.heroOverlay} pointerEvents="box-none">
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={ui('Volver')} style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color="#FDDD56" />
            </TouchableOpacity>

            {requiresPremium && photos.length > 1 && <View style={styles.photoCount}>
              <Text style={styles.photoCountText}>{photoIndex + 1}/{photos.length}</Text>
            </View>}

            <View style={styles.heroText} pointerEvents="none" onLayout={({ nativeEvent }) => {
              const height = Math.ceil(nativeEvent.layout.height);
              setHeroTextLayout(current => current?.key === heroLayoutKey && current.height === height ? current : { key: heroLayoutKey, height });
            }}>
              <ExperienceTags tags={getExperienceTags(experience)} />
              <Text style={styles.title}>{experience.title}</Text>
              {!!summary && <Text style={styles.heroSummary} numberOfLines={2} ellipsizeMode="tail">{summary}</Text>}
            </View>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.regionMetaPill}>
            <Text style={styles.regionMetaText}>{experience.region ?? 'NY'}</Text>
          </View>
          <View style={styles.metaPill}>
            <Ionicons name="calendar-outline" size={15} color="#FDDD56" />
            <Text style={styles.metaText}>{experience.date}</Text>
          </View>
        </View>

        <View style={[styles.accessBadge, !isPaidEvent && isLocked ? styles.premiumBadge : styles.freeBadge]}>
          <Ionicons
            name={scheduledQr ? 'lock-closed' : isPaidEvent ? 'ticket-outline' : isLocked ? 'lock-closed' : requiresPremium ? 'lock-open' : 'gift-outline'}
            size={15}
            color={scheduledQr || (!isPaidEvent && isLocked) ? '#FDDD56' : '#050505'}
          />
          <Text style={[styles.accessText, !isPaidEvent && isLocked && styles.premiumText]}>
            {scheduledQr
              ? ui('PRÓXIMAMENTE')
              : isPaidEvent
              ? ui("Evento con entrada de pago")
              : isLocked
              ? ui("Premium ITC Club")
              : requiresPremium
                ? ui("Beneficio para miembros ITC Club")
                : ui("Beneficio gratis")}
          </Text>
        </View>

        {experience.isAgeRestricted && (
          <View style={styles.ageNotice}>
            <View style={styles.ageBadge}><Text style={styles.ageBadgeText}>21+</Text></View>
            <Text style={styles.ageText}>
              {ui('Solo para mayores de 21 años. El comercio puede pedirte una identificación. Bebe con responsabilidad.')}
            </Text>
          </View>
        )}

        {requiresPremium && experience.memberBenefit && (
          <View style={styles.benefitCard}>
            <View style={styles.benefitHeading}>
              <Ionicons name="gift-outline" size={20} color={COLORS.gold} />
              <Text style={styles.benefitLabel}>{ui("BENEFICIO ITC CLUB")}</Text>
            </View>
            <Text style={styles.benefitTitle}>{experience.memberBenefit}</Text>
            {!!experience.memberBenefitDetails && <ExpandableText text={experience.memberBenefitDetails} style={styles.benefitDetails} showChevron={false} />}
          </View>
        )}

        {!!experience.description?.trim() && <ExpandableSection
          key={`${experience.id}-description`}
          title={ui("Descripción")}
          preview={<Text style={styles.description} numberOfLines={3} ellipsizeMode="tail">{experience.description}</Text>}
        >
          <Text style={styles.description}>{experience.description}</Text>
        </ExpandableSection>}

        {experience.includes.length > 0 && <ExpandableSection
          key={`${experience.id}-includes`}
          title={ui("Qué incluye")}
          preview={experience.includes.slice(0, 2).map((item, index) => (
            <View key={index} style={styles.includeRow}>
              <Text style={styles.includeBullet} accessible={false}>•</Text>
              <Text style={styles.includeText} numberOfLines={2} ellipsizeMode="tail">{item}</Text>
            </View>
          ))}
        >
          {experience.includes.map((item, index) => (
            <View key={index} style={styles.includeRow}>
              <Text style={styles.includeBullet} accessible={false}>•</Text>
              <Text style={styles.includeText}>{item}</Text>
            </View>
          ))}
        </ExpandableSection>}

        {(experience.location || experience.shortAddress || !!experience.locations?.length || eventMapsUrl(experience)) && <View style={styles.addressCard}>
          <Text style={styles.addressTitle}>{ui("Ubicación")}</Text>
          <ExperienceLocation experience={experience} full />
        </View>}

        <ExperienceSocialLinks experience={experience} />

        <View style={styles.recommendationCard}>
          <Text style={styles.recommendationLabel}>{ui("Recomendación ITC")}</Text>
          <Text style={styles.recommendationText}>{experience.recommendation}</Text>
        </View>

        {scheduledQr && <View style={styles.countdown} accessible accessibilityRole="text" accessibilityLiveRegion="none">
          <View style={styles.countdownHeading}>
            <Ionicons name="time-outline" size={16} color="#FFFFFF" accessible={false} />
            <Text style={styles.countdownCaption}>{ui('Disponible en')}</Text>
          </View>
          <Text style={styles.countdownTime}>{schedule.phase === 'checking'
            ? ui('Comprobando disponibilidad…') : formatBenefitCountdown(schedule.remainingMs, ui)}</Text>
          <Text style={styles.countdownHint}>{ui('Se activará automáticamente')}</Text>
        </View>}

        <TouchableOpacity
          style={[styles.ctaButton, !isPaidEvent && isLocked && styles.lockedButton, couponUnavailable && styles.disabledButton, scheduledQr && styles.scheduledButton]}
          onPress={() => void handleCta()}
          disabled={!isCtaEnabled || benefitLoading}
          accessibilityRole="button"
          accessibilityLabel={scheduledQr ? ui('PRÓXIMAMENTE') : couponUnavailable && !isLocked && !isPaidEvent ? ui(experience.couponStatus === 'sold_out' ? 'AGOTADO' : 'NO DISPONIBLE') : isPaidEvent ? `${ticketCta}: ${experience.title}` : isLocked ? ui('Suscríbete para desbloquear') : hasBenefitAction ? `${benefitCta}: ${experience.title}` : undefined}
          accessibilityHint={scheduledQr ? ui('El QR estará disponible cuando comience el beneficio.') : benefitAction === 'qr' && hasBenefitAction ? ui('Genera un código QR válido durante 24 horas') : isPaidEvent || benefitAction === 'external' ? ui("Abre un sitio externo") : undefined}
          accessibilityState={{ disabled: !isCtaEnabled || benefitLoading, busy: benefitLoading }}
        >
          {benefitLoading ? <ActivityIndicator color={COLORS.background} /> : <Ionicons
            name={scheduledQr ? 'lock-closed' : isPaidEvent ? 'ticket-outline' : isLocked ? 'lock-closed' : requiresPremium ? 'checkmark-circle' : 'gift-outline'}
            size={18}
            color={scheduledQr || (!isPaidEvent && isLocked) ? '#FDDD56' : '#050505'}
          />}
          <Text style={[styles.ctaText, !isPaidEvent && isLocked && styles.lockedText, scheduledQr && styles.lockedText]}>
            {scheduledQr
              ? ui('PRÓXIMAMENTE')
              : isPaidEvent
              ? ticketCta.toUpperCase()
              : isLocked
              ? ui("SUSCRÍBETE PARA DESBLOQUEAR")
              : benefitAction === 'qr' && hasReservation && !couponUnavailable
                ? ui('VER MI QR')
              : experience.couponStatus === 'sold_out'
                ? ui('AGOTADO')
              : (experience.couponStatus === 'paused' || schedule.blocked)
                ? ui('NO DISPONIBLE')
              : hasBenefitAction
                ? benefitCta.toUpperCase()
              : requiresPremium
                ? ui("BENEFICIO DESBLOQUEADO")
                : ui("BENEFICIO DISPONIBLE")}
          </Text>
        </TouchableOpacity>

        {disclosure && <Text style={styles.partnerDisclosure}>{ui(disclosure)}</Text>}

        {!!benefitError && <Text style={styles.ctaError} accessibilityRole="alert">{benefitError}</Text>}

        <View style={{ height: 70 }} />
      </ScrollView>
      <Modal visible={Boolean(visibleCode)} transparent animationType="fade" onRequestClose={() => setBenefitCode(null)}>
        <ScrollView style={styles.modalScrim} contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.qrModal} accessibilityViewIsModal>
            <TouchableOpacity style={styles.modalClose} onPress={() => setBenefitCode(null)} accessibilityRole="button" accessibilityLabel={ui('Cerrar código QR')} hitSlop={8}>
              <Ionicons name="close" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <ClubLogo width={96} style={{ alignSelf: "center" }} />
            <Text style={styles.qrTitle}>{ui('Tu beneficio está listo')}</Text>
            <Text style={styles.qrSubtitle}>{experience.memberBenefit || visibleCode?.benefit}</Text>
            {visibleCode?.qrDataUrl && <View style={styles.qrFrame}>
              <Image source={{ uri: visibleCode.qrDataUrl }} style={styles.qrImage} accessibilityLabel={ui('Código QR para canjear el beneficio')} />
            </View>}
            <Text style={styles.qrInstruction}>{experience.benefitInstructions || ui('Muestra este código al personal para validar el beneficio.')}</Text>
            <View style={styles.qrValidity}><Ionicons name="time-outline" size={18} color={COLORS.gold} /><Text style={styles.qrValidityText}>{ui('Válido por 24 horas · un solo uso')}</Text></View>
            <Text style={styles.qrReference}>{visibleCode?.reference}</Text>
            <TouchableOpacity style={styles.qrDoneButton} onPress={() => setBenefitCode(null)} accessibilityRole="button"><Text style={styles.qrDoneText}>{ui('LISTO')}</Text></TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
    </SafeAreaView>
  );
}

const COLORS = {
  background: '#050505',
  card: '#121212',
  gold: '#FDDD56',
  white: '#FFFFFF',
  secondary: '#A6A6A6',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: { width: '100%', maxWidth: 860, alignSelf: 'center',
    paddingBottom: 120,
  },
  hero: {
    height: 360,
    backgroundColor: COLORS.card,
  },
  heroImage: {
    height: 360,
  },
  heroShade: {
    position: 'absolute', top: 0, right: 0, bottom: 0, left: 0,
    backgroundColor: 'rgba(0,0,0,0.34)',
  },
  heroGradient: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  heroSummary: { color: '#FFFFFF', fontSize: 15, lineHeight: 22, marginTop: 7 },
  heroOverlay: {
    position: 'absolute', top: 0, right: 0, bottom: 0, left: 0,
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  photoCount: {
    position: 'absolute', top: 26, right: 20,
    borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5,
    backgroundColor: 'rgba(0,0,0,0.72)',
  },
  photoCountText: { color: COLORS.white, fontSize: 12, fontWeight: '800' },
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
  regionMetaPill: {
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 9,
    backgroundColor: COLORS.gold,
  },
  regionMetaText: {
    color: COLORS.background,
    fontSize: 12,
    fontWeight: '900',
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
  ageNotice: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 20, marginTop: 16, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#5A4A1A', backgroundColor: '#15120A' },
  ageBadge: { minWidth: 44, height: 32, borderRadius: 8, backgroundColor: COLORS.gold, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  ageBadgeText: { color: '#000', fontWeight: '900', fontSize: 14 },
  ageText: { flex: 1, color: '#EDEDED', fontSize: 14, lineHeight: 20 },
  benefitCard: { marginHorizontal: 20, marginTop: 20, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: COLORS.gold, backgroundColor: COLORS.card },
  benefitHeading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  benefitLabel: { color: COLORS.gold, fontSize: 12, fontWeight: '900' },
  benefitTitle: { color: '#FDDD56', fontSize: 15, lineHeight: 21, fontWeight: '700', marginTop: 10, alignSelf: 'flex-start', maxWidth: '100%', backgroundColor: 'rgba(253,221,86,0.12)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  benefitDetails: { color: COLORS.secondary, fontSize: 14, lineHeight: 21, marginTop: 8 },
  addressCard: { marginHorizontal: 20, marginTop: 20 },
  addressTitle: { color: COLORS.white, fontSize: 20, fontWeight: '800', marginBottom: 10 },
  addressRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  addressText: { flex: 1, color: COLORS.secondary, fontSize: 15, lineHeight: 23 },
  description: { color: '#E0E0E0', fontSize: 15, lineHeight: 23 },
  includeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  includeBullet: { color: '#E0E0E0', fontSize: 15, lineHeight: 23 },
  includeText: { color: '#E0E0E0', fontSize: 15, flex: 1, lineHeight: 23 },
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
  countdown: { marginHorizontal: 20, marginTop: 24, alignItems: 'center', gap: 5 },
  countdownHeading: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  countdownCaption: { color: '#FFFFFF', fontSize: 13, lineHeight: 18 },
  countdownTime: { color: '#FFFFFF', fontSize: 16, lineHeight: 22, fontWeight: '700', textAlign: 'center', fontVariant: ['tabular-nums'] },
  countdownHint: { color: '#B8B8B8', fontSize: 12, lineHeight: 18, textAlign: 'center' },
  scheduledButton: { marginTop: 16, backgroundColor: '#282411', borderWidth: 1, borderColor: '#9E8B35' },
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
  disabledButton: { opacity: 0.5 },
  ctaText: {
    color: COLORS.background,
    fontSize: 14,
    fontWeight: '900',
  },
  lockedText: {
    color: COLORS.gold,
  },
  partnerDisclosure: { color: '#B8B8B8', fontSize: 13, lineHeight: 19, marginHorizontal: 20, marginTop: 12 },
  ctaError: { color: '#FFB4AB', marginHorizontal: 20, marginTop: 12, fontSize: 14, lineHeight: 20 },
  modalScrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.84)' },
  modalScrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  qrModal: { backgroundColor: COLORS.card, borderRadius: 24, borderWidth: 1, borderColor: '#3B3219', paddingHorizontal: 24, paddingTop: 32, paddingBottom: 24, alignItems: 'center', maxWidth: 480, width: '100%', alignSelf: 'center' },
  modalClose: { position: 'absolute', top: 10, right: 10, width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 24 },
  qrEyebrow: { color: COLORS.gold, fontWeight: '900', fontSize: 12, letterSpacing: 2, marginBottom: 10 },
  qrTitle: { color: COLORS.white, fontSize: 24, lineHeight: 30, fontWeight: '900', textAlign: 'center' },
  qrSubtitle: { color: COLORS.secondary, fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 8 },
  qrFrame: { backgroundColor: COLORS.white, borderRadius: 18, padding: 12, marginTop: 22 },
  qrImage: { width: 232, height: 232 },
  qrInstruction: { color: COLORS.white, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 18 },
  qrValidity: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 },
  qrValidityText: { color: COLORS.gold, fontSize: 13, fontWeight: '800' },
  qrReference: { color: '#8E8E8E', fontSize: 12, marginTop: 10 },
  qrDoneButton: { width: '100%', minHeight: 52, backgroundColor: COLORS.gold, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 22 },
  qrDoneText: { color: COLORS.background, fontWeight: '900', fontSize: 14 },
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
