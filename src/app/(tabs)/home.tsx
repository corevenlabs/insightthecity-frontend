import { HomeSearch } from '../../components/HomeSearch';
import { matchesPlanTags } from '../../lib/homeSearch';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { HomePromotion } from '../../components/HomePromotion';
import { BenefitPreview } from '../../components/BenefitPreview';
import { getExperienceTags, matchesExperienceTags } from '@/lib/experienceFilters';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useState, type ComponentProps } from 'react';
import {
  ActivityIndicator,
  Image,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Experience } from '@/constants/experiences';
import { GuideCard } from '../../components/GuideCard';
import { NewsImage } from '../../components/NewsImage';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { fetchNews, formatDate, type NewsCard } from '../../lib/news';
import { fetchExperiences } from '../../lib/experiences';
import { fetchGuides, type Guide } from '../../lib/guides';
import {
  fetchCurrentWeather,
  weatherDescription,
  type CurrentWeather,
} from '../../lib/weather';

// Primer nombre para el saludo ("Carlos Pérez" -> "Carlos").
function firstName(name: string | null, email?: string): string | null {
  if (name && name.trim()) return name.trim().split(/\s+/)[0];
  if (email) return email.split('@')[0];
  return null;
}

function compactWeatherSymbol(
  code: number,
  isDay: boolean,
): ComponentProps<typeof SymbolView>['name'] {
  if (!isDay) {
    return code <= 1
      ? { ios: 'moon.stars.fill', android: 'nightlight', web: 'nightlight' }
      : { ios: 'cloud.moon.fill', android: 'partly_cloudy_night', web: 'partly_cloudy_night' };
  }
  if (code === 0) return { ios: 'sun.max.fill', android: 'sunny', web: 'sunny' };
  if (code <= 3) {
    return { ios: 'cloud.sun.fill', android: 'partly_cloudy_day', web: 'partly_cloudy_day' };
  }
  if (code === 45 || code === 48) return { ios: 'cloud.fog.fill', android: 'foggy', web: 'foggy' };
  if (code >= 51 && code <= 57) return { ios: 'cloud.drizzle.fill', android: 'rainy', web: 'rainy' };
  if (code >= 71 && code <= 86) {
    return { ios: 'cloud.snow.fill', android: 'weather_snowy', web: 'weather_snowy' };
  }
  if (code >= 61 && code <= 82) return { ios: 'cloud.rain.fill', android: 'rainy', web: 'rainy' };
  if (code >= 95) return { ios: 'cloud.bolt.rain.fill', android: 'thunderstorm', web: 'thunderstorm' };
  return { ios: 'cloud.fill', android: 'cloud', web: 'cloud' };
}

function HeaderWeather() {
  const { t, ui } = useLanguage();
  const [weather, setWeather] = useState<CurrentWeather | null>(null);

  useEffect(() => {
    let active = true;
    fetchCurrentWeather()
      .then((current) => {
        if (active) setWeather(current);
      })
      .catch(() => {
        // El widget completo al final del Home conserva el estado de reintento.
      });
    return () => {
      active = false;
    };
  }, []);

  if (!weather) {
    return (
      <View style={styles.headerWeatherBadge} accessibilityLabel={t('weather.loading')}>
        <ActivityIndicator size="small" color={COLORS.gold} />
      </View>
    );
  }

  const description = ui(weatherDescription(weather.weatherCode));

  return (
    <View
      style={styles.headerWeatherBadge}
      accessibilityLabel={t('weather.degrees', {
        description,
        temperature: Math.round(weather.temperature),
      })}
    >
      <SymbolView
        name={compactWeatherSymbol(weather.weatherCode, weather.isDay)}
        size={38}
        type="multicolor"
        style={styles.headerWeatherSymbol}
        accessibilityLabel={description}
      />
      <Text style={styles.headerWeatherTemperature}>{Math.round(weather.temperature)}°</Text>
    </View>
  );
}

function openExperience(id: string) {
  router.push({
    pathname: '/experience-detail',
    params: { id },
  } as any);
}

function RecommendationsCarousel({ experiences }: { experiences: Experience[] }) {
  const { ui, tagLabel } = useLanguage();
  const { carouselWidth: bannerWidth } = useResponsiveLayout();
  const intervalWidth = bannerWidth + 10;

  return (
    <View>
      <ScrollView
        horizontal
        snapToInterval={intervalWidth}
        decelerationRate="fast"
        disableIntervalMomentum
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.recommendationsBannerTrack}

      >
        {experiences.map((experience) => {
          const primaryTag = getExperienceTags(experience)[0];
          return (
            <TouchableOpacity
              key={experience.id}
              style={[styles.recommendationBanner, { width: bannerWidth }]}
              activeOpacity={0.84}
              accessibilityRole="button"
              accessibilityLabel={ui('Abrir {title}', { title: experience.title })}
              onPress={() => openExperience(experience.id)}
            >
              <Image source={{ uri: experience.image }} style={styles.recommendationBannerImage} />
              <View style={styles.recommendationBannerOverlay}>
                <Text style={styles.recommendationBannerCategory} numberOfLines={1}>
                  {primaryTag ? tagLabel(primaryTag).toUpperCase() : experience.category.toUpperCase()}
                </Text>
                <Text style={styles.recommendationBannerTitle} numberOfLines={2}>{experience.title}</Text>
                {!!experience.description && <Text style={styles.recommendationDescription} numberOfLines={2}>{experience.description}</Text>}
                <View style={styles.recommendationBannerFooter}>
                  <View style={styles.recommendationRegionRow}>
                    <Ionicons name="location-outline" size={18} color={COLORS.secondary} />
                    <Text style={styles.recommendationBannerRegion}>{experience.region ?? 'NY'}</Text>
                  </View>

                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

function GuidesCarousel({ guides }: { guides: Guide[] }) {
  const { ui } = useLanguage();
  const { carouselWidth: cardWidth } = useResponsiveLayout();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}
      snapToInterval={cardWidth + 12} decelerationRate="fast"
      contentContainerStyle={{ gap: 12, paddingRight: 20 }}>
      {guides.map((guide) => (
        <GuideCard key={guide.id} guide={guide} width={cardWidth}
          accessibilityLabel={ui('Abrir guía: {title}', { title: guide.title })}
          onPress={() => router.push('/guides')} />
      ))}
    </ScrollView>
  );
}

type HomeNewsSectionProps = {
  section: 'ny-al-dia' | 'que-hacer';
  title: string;
  route: '/ny-al-dia' | '/que-hacer';
  tags?: string[];
};

function HomeNewsSection({ section, title, route, tags = [] }: HomeNewsSectionProps) {
  const { t, ui, language } = useLanguage();
  const { planWidth } = useResponsiveLayout();
  const [items, setItems] = useState<NewsCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isNewsSection = section === 'ny-al-dia';
  const carouselCardWidth = planWidth;

  // reloadKey vuelve a disparar la carga al pulsar "Reintentar".
  const [reloadKey, setReloadKey] = useState(0);
  const filteringPlans = !isNewsSection && tags.length > 0;

  useEffect(() => {
    let alive = true;
    const itemLimit = isNewsSection ? 5 : 4;
    const load = async () => {
      const first = await fetchNews(section, 1, filteringPlans ? 20 : itemLimit);
      const loaded = [...first.items];
      if (filteringPlans) for (let page = 2; page <= first.totalPages && alive; page++) {
        loaded.push(...(await fetchNews(section, page, 20)).items);
      }
      return loaded;
    };
    load()
      .then((loaded) => {
        if (!alive) return;
        setItems(loaded);
        setError(null);
      })
      .catch(() => { if (alive) setError('No se pudo cargar el contenido.'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [isNewsSection, section, reloadKey, filteringPlans]);

  const visibleItems = isNewsSection ? items : items.filter(item => matchesPlanTags(item, tags)).slice(0, 4);

  const retry = () => {
    setLoading(true);
    setError(null);
    setReloadKey((key) => key + 1);
  };

  const openArticle = (item: NewsCard) => {
    router.push({
      pathname: '/news-detail',
      params: { id: String(item.id), section: title, source: section },
    } as any);
  };

  const renderImage = (item: NewsCard, imageStyle: object) => (
    <NewsImage
      uri={item.image}
      style={imageStyle}
      accessibilityLabel={ui('Imagen de {title}', { title: item.title })}
    />
  );

  const renderNewsLayout = () => (
    <View style={styles.newsHomeList}>
      {visibleItems.map((item) => (
        <TouchableOpacity key={item.id} accessibilityRole="button"
          accessibilityLabel={`${item.title}, ${formatDate(item.date, language)}`}
          style={styles.newsHomeCard} onPress={() => openArticle(item)} activeOpacity={0.72}>
          {renderImage(item, styles.newsHomeImage)}
          <View style={styles.newsHomeOverlay}>
            <Text style={styles.newsHomeTitle} numberOfLines={2}>{item.title}</Text>
            {!!item.excerpt && <Text style={styles.newsHomeExcerpt} numberOfLines={1}>{item.excerpt}</Text>}
            <Text style={styles.newsHomeDate}>{formatDate(item.date, language)}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPlansCarousel = () => (
    <ScrollView
      horizontal
      nestedScrollEnabled
      decelerationRate="fast"
      snapToAlignment="start"
      snapToInterval={carouselCardWidth + 12}
      disableIntervalMomentum
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.plansCarouselContent}
      accessibilityRole="list"
    >
      {visibleItems.map((item) => (
        <TouchableOpacity
          key={item.id}
          accessibilityRole="button"
          accessibilityLabel={`${item.title}, ${formatDate(item.date, language)}`}
          accessibilityHint="Abre los detalles del plan"
          style={[styles.planCarouselCard, { width: carouselCardWidth }]}
          onPress={() => openArticle(item)}
          activeOpacity={0.82}
        >
          {renderImage(item, styles.planCarouselImage)}
          <View style={styles.planCarouselOverlay}>
            <Text style={styles.planCarouselTitle} numberOfLines={2}>{item.title}</Text>
            {!!item.excerpt && (
              <Text style={styles.planCarouselExcerpt} numberOfLines={2}>{item.excerpt}</Text>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.newsSection}>
      <View style={styles.newsSectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={ui('Ver todo: {title}', { title: title })}
          style={styles.newsSeeAllButton}
          onPress={() => router.push(route as any)}
          activeOpacity={0.7}
        >
          <Text style={styles.newsSeeAllText}>{t('common.seeAll')}</Text>
          <Ionicons name="arrow-forward" size={18} color={COLORS.gold} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.newsState} accessibilityLabel={ui('Cargando {title}', { title: title })}>
          <ActivityIndicator color={COLORS.gold} />
        </View>
      ) : error ? (
        <View style={styles.newsState}>
          <Ionicons name="cloud-offline-outline" size={28} color={COLORS.secondary} />
          <Text style={styles.newsError}>{ui('No se pudo cargar el contenido.')}</Text>
          <TouchableOpacity
            accessibilityRole="button"
            style={styles.retryButton}
            onPress={retry}
            activeOpacity={0.72}
          >
            <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : visibleItems.length === 0 ? (
        <Text style={styles.emptyText}>{ui("Todavía no hay publicaciones en esta sección.")}</Text>
      ) : (
        isNewsSection ? renderNewsLayout() : renderPlansCarousel()
      )}
    </View>
  );
}

export default function HomeScreen() {
  const { carouselWidth: benefitCardWidth, gutter, width, fontScale } = useResponsiveLayout();
  const { user, refreshUser } = useAuth();
  const { t, ui } = useLanguage();
  const name = firstName(user?.name ?? null, user?.email);
  const [clubBenefits, setClubBenefits] = useState<Experience[]>([]);
  const [recommendations, setRecommendations] = useState<Experience[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [catalog, setCatalog] = useState<Experience[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState(false);
  const [catalogRetry, setCatalogRetry] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchActive = searchOpen && searchQuery.trim().length > 0;

  useFocusEffect(useCallback(() => {
    let alive = true;
    setCatalogLoading(true); setCatalogError(false);
    void refreshUser().catch(() => undefined);
    void Promise.allSettled([fetchExperiences(), fetchGuides()]).then(([experienceResult, guideResult]) => {
      if (!alive) return;
      if (experienceResult.status === 'fulfilled') {
        const experiences = experienceResult.value;
        setCatalog(experiences);
        setClubBenefits(experiences.filter(item => item.access === 'premium'));
        const curated = experiences.filter(item => item.section === 'top_today' && item.access !== 'premium');
        setRecommendations(curated.length > 0 ? curated : experiences.filter(item => item.access !== 'premium'));
      }
      if (guideResult.status === 'fulfilled') setGuides(guideResult.value);
      setCatalogError(experienceResult.status === 'rejected' || guideResult.status === 'rejected');
      setCatalogLoading(false);
    });
    return () => { alive = false; };
  // Retry changes the focus callback so a failed catalogue load can be repeated.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshUser, catalogRetry]));

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}
      onTouchStart={() => { if (searchOpen) { setSearchOpen(false); Keyboard.dismiss(); } }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={[styles.content, { paddingHorizontal: gutter }]}
      >
        {/* HEADER */}

        <View style={[styles.header, (width < 360 || fontScale > 1.35) && { flexWrap: 'wrap', rowGap: 8 }]}>
          <View style={styles.headerIdentity}>
            <Text style={styles.headerBrand} numberOfLines={1}><Text style={styles.headerBrandWhite}>ITC </Text><Text style={styles.headerBrandGold}>CLUB</Text></Text>
            <View style={styles.headerDivider} />
            <Text style={styles.greeting} numberOfLines={1}>
              {name ? t('home.hello', { name }) : t('home.helloGuest')}
            </Text>
          </View>

          <HeaderWeather />
        </View>

        <HomeSearch key={user?.id ?? 'guest'} experiences={catalog} guides={guides} tags={selectedTags}
          isOpen={searchOpen} onOpenChange={setSearchOpen}
          catalogLoading={catalogLoading} catalogError={catalogError} onRetryCatalog={() => setCatalogRetry(value => value + 1)}
          onTagsChange={setSelectedTags} query={searchQuery} onQueryChange={setSearchQuery} />

        <View style={searchActive ? { display: 'none' } : undefined}>
        <HomePromotion />

        {/* BENEFICIOS ITC CLUB */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {ui('BENEFICIOS ITC CLUB').replace(/\s*CLUB$/i, '')} <Text style={styles.headerBrandGold}>CLUB</Text>
          </Text>

          <TouchableOpacity
            style={styles.sectionHeaderAction}
            onPress={() => router.push('/club')}
          >
            <Text style={styles.seeMore}>
              {t('common.seeAll')}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.gold} />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.benefitsCarousel}
        >
          {clubBenefits.filter(item => matchesExperienceTags(item, selectedTags)).map((experience) => (
            <BenefitPreview
              key={`${experience.id}:${experience.image}:${(experience.images ?? []).join('|')}`}
              experience={experience}
              width={benefitCardWidth}
            />
          ))}
        </ScrollView>
        {selectedTags.length > 0 && !clubBenefits.some(item => matchesExperienceTags(item, selectedTags)) && <Text style={styles.emptyText}>{ui('No hay beneficios con estos filtros.')}</Text>}

        {/* ITC RECOMIENDA */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {ui('ITC RECOMIENDA')}
          </Text>

          <TouchableOpacity
            style={styles.sectionHeaderAction}
            onPress={() => router.push('/explore')}
          >
            <Text style={styles.seeMore}>
              {t('common.seeAll')}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.gold} />
          </TouchableOpacity>
        </View>

        <RecommendationsCarousel experiences={recommendations.filter(item => matchesExperienceTags(item, selectedTags))} />

        {selectedTags.length > 0 && !recommendations.some(item => matchesExperienceTags(item, selectedTags)) && <Text style={styles.emptyText}>{ui('No hay recomendaciones con estos filtros.')}</Text>}
        {/* QUE HACER EN NEW YORK */}
        <HomeNewsSection
          tags={selectedTags}
          section="que-hacer"
          title={ui("QUÉ HACER EN NEW YORK")}
          route="/que-hacer"
        />

        {/* GUIAS */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {t('home.guides')}
          </Text>

          <TouchableOpacity accessibilityRole="button" accessibilityLabel={ui('Ver todas las guías')} style={styles.sectionHeaderAction} onPress={() => router.push('/guides')}>
            <Text style={styles.seeMore}>{t('common.seeAll')}</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.gold} />
          </TouchableOpacity>
        </View>

        {guides.length > 0 ? (
          <GuidesCarousel guides={guides} />
        ) : (
          <TouchableOpacity
            style={styles.newsState}
            activeOpacity={0.72}
            accessibilityRole="button"
            accessibilityLabel={ui('Abrir guías')}
            onPress={() => router.push('/guides')}
          >
            <Ionicons name="book-outline" size={30} color={COLORS.gold} />
            <Text style={styles.emptyText}>{ui('Todavía no hay guías publicadas.')}</Text>
          </TouchableOpacity>
        )}

        {/* NY AL DIA */}
        <HomeNewsSection
          section="ny-al-dia"
          title={ui("NY AL DÍA")}
          route="/ny-al-dia"
        />

        </View>

      </ScrollView>

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

  content: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 32,
  },

  header: {
    minHeight: 58,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerIdentity: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 12,
  },

  headerBrand: { fontSize: 22, lineHeight: 28, fontWeight: '800', letterSpacing: -0.8 },
  headerBrandWhite: { color: COLORS.white },
  headerBrandGold: { color: COLORS.gold },
  headerLogo: {
    color: COLORS.gold,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    letterSpacing: -0.8,
  },

  headerDivider: {
    width: 1,
    height: 34,
    marginHorizontal: 13,
    backgroundColor: COLORS.gold,
    opacity: 0.65,
  },

  greeting: {
    flexShrink: 1,
    color: COLORS.white,
    fontSize: 18,
    minWidth: 0,
    fontWeight: '500',
  },

  headerWeatherBadge: {
    minWidth: 72,
    height: 44,
    flexDirection: 'row',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },

  headerWeatherSymbol: {
    width: 38,
    height: 38,
  },

  headerWeatherTemperature: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
  },

  searchBar: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    paddingHorizontal: 16,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#3A3A3A',
    backgroundColor: '#232323',
  },

  searchPlaceholder: {
    flex: 1,
    color: COLORS.secondary,
    fontSize: 16,
  },

  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#171717',
    justifyContent: 'center',
    alignItems: 'center',
  },

  heroCard: {
    marginTop: 24,
    height: 220,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
  },

  heroImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },

  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    padding: 20,
    justifyContent: 'flex-end',
  },

  partnershipCard: {
    minHeight: 238,
    marginTop: 16,
    overflow: 'hidden',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#3A3115',
    backgroundColor: COLORS.card,
  },

  partnershipImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },

  partnershipOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.58)',
  },

  partnershipLabel: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 9,
  },

  partnershipLabelText: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
  },

  partnershipTitle: {
    maxWidth: 300,
    color: COLORS.white,
    fontSize: 23,
    lineHeight: 27,
    fontWeight: '800',
  },

  partnershipDescription: {
    maxWidth: 310,
    marginTop: 7,
    color: '#D0D0D0',
    fontSize: 13,
    lineHeight: 18,
  },

  partnershipCta: {
    alignSelf: 'flex-start',
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 14,
    paddingHorizontal: 13,
    borderRadius: 11,
    backgroundColor: COLORS.gold,
  },

  partnershipCtaText: {
    color: '#050505',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

 clubTitle: {
  fontSize: 34,
  fontWeight: '800',
  
},

clubWhite: {
  color: '#FFFFFF',
},

clubGold: {
  color: '#FDDD56',
},

  clubDescription: {
    color: COLORS.white,
    marginTop: 8,
    lineHeight: 22,
  },

  joinBtn: {
    backgroundColor: COLORS.gold,
    alignSelf: 'flex-start',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 16,
  },

  joinBtnText: {
    fontWeight: '700',
    color: '#000',
  },

  sectionHeader: {
    marginTop: 24,
    marginBottom: 8,
    minHeight: 44,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionTitle: {
    color: COLORS.white,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    flexShrink: 1,
  },

  seeMore: {
    color: COLORS.gold,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },

  sectionHeaderAction: {
    flexShrink: 0,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingLeft: 10,
  },

  benefitsCarousel: {
    paddingRight: 8,
  },

  benefitCard: {
    overflow: 'hidden',
    marginRight: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2C2C2C',
    backgroundColor: COLORS.card,
  },

  benefitImageWrap: {
    width: '100%',
    aspectRatio: 1.72,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
  },

  benefitImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  benefitFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    marginTop: 4,
  },

  benefitBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexShrink: 1,
    maxWidth: '60%',
    minHeight: 21,
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderRadius: 5,
    backgroundColor: '#FDDD56',
  },

  benefitBadgeText: {
    color: COLORS.background,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
  },

  benefitBookmark: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 30,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 7,
    backgroundColor: 'rgba(5,5,5,0.68)',
  },

  benefitBody: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 10,
  },

  benefitCategory: {
    color: COLORS.gold,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '600',
    letterSpacing: 1.2,
  },

  benefitName: {
    marginTop: 2,
    color: COLORS.white,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '700',
  },

  benefitRegionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },

  benefitRegion: {
    color: COLORS.secondary,
    fontSize: 12,
    lineHeight: 16,
  },

  recommendationsBannerTrack: {
    paddingRight: 10,
  },

  recommendationBanner: {
    flexDirection: 'row', minHeight: 132, overflow: 'hidden', marginRight: 10,
    borderRadius: 12, borderWidth: 1, borderColor: '#2C2C2C', backgroundColor: COLORS.card,
  },
  recommendationBannerImage: {
    width: '48%', alignSelf: 'stretch', resizeMode: 'cover', backgroundColor: '#1A1A1A',
  },
  recommendationBannerOverlay: { flex: 1, minWidth: 0, justifyContent: 'center', padding: 10 },
  recommendationBannerCategory: { color: COLORS.gold, fontSize: 9, lineHeight: 13, letterSpacing: 1, paddingRight: 22 },
  recommendationBannerTitle: { marginTop: 4, color: COLORS.white, fontSize: 16, lineHeight: 21, fontWeight: '700', paddingRight: 16 },
  recommendationDescription: { color: COLORS.secondary, fontSize: 12, lineHeight: 17, marginTop: 5 },
  recommendationBannerFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  recommendationRegionRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  recommendationBannerRegion: { color: COLORS.secondary, fontSize: 12, lineHeight: 16 },
  recommendationOpenIcon: { position: 'absolute', right: 8, top: 8 },

  newsSection: {
    marginTop: 24,
  },

  newsSectionHeader: {
    marginBottom: 8,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },

  newsSeeAllButton: {
    flexShrink: 0,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 12,
  },

  newsSeeAllText: {
    color: COLORS.gold,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },

  newsState: {
    minHeight: 120,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F1F1F',
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 20,
  },

  newsError: {
    color: COLORS.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },

  retryButton: {
    minHeight: 44,
    paddingHorizontal: 18,
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },

  retryButtonText: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '800',
  },

  emptyText: {
    color: COLORS.secondary,
    paddingVertical: 24,
    textAlign: 'center',
  },

  newsHomeList: { gap: 16 },
  newsHomeCard: {
    flexDirection: 'row', alignItems: 'center', minHeight: 88, gap: 14,
  },
  newsHomeImage: {
    width: 88, height: 88, borderRadius: 12, backgroundColor: '#1A1A1A',
  },
  newsHomeOverlay: { flex: 1, minWidth: 0, gap: 5, paddingVertical: 4 },
  newsHomeTitle: { color: COLORS.white, fontSize: 16, lineHeight: 21, fontWeight: '700' },
  newsHomeExcerpt: { color: COLORS.secondary, fontSize: 13, lineHeight: 18 },
  newsHomeDate: { color: COLORS.secondary, fontSize: 12, lineHeight: 17 },

  newsFeaturedCard: {
    height: 250,
    overflow: 'hidden',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    backgroundColor: COLORS.card,
    marginBottom: 12,
  },

  newsFeaturedImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backgroundColor: '#1A1A1A',
  },

  newsFeaturedOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 18,
    backgroundColor: 'rgba(0,0,0,0.46)',
  },

  newsFeaturedDate: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 7,
  },

  newsFeaturedTitle: {
    color: COLORS.white,
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '800',
  },

  newsCompactCard: {
    minHeight: 104,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#242424',
    backgroundColor: COLORS.card,
  },

  newsCompactImage: {
    width: 124,
    minHeight: 104,
    backgroundColor: '#1A1A1A',
  },

  newsCompactContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  newsCompactDate: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 6,
  },

  newsCompactTitle: {
    color: COLORS.white,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },

  plansCarouselContent: {
    paddingRight: 8,
  },

  planCarouselCard: {
    overflow: 'hidden',
    marginRight: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2C2C2C',
    backgroundColor: COLORS.card,
  },

  planCarouselImage: {
    width: '100%',
    aspectRatio: 1.6,
    backgroundColor: '#1A1A1A',
  },


  planCarouselOverlay: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: COLORS.card,
  },

  planCarouselTitle: {
    color: COLORS.white,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '700',
  },

  planCarouselExcerpt: {
    color: COLORS.secondary,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
  },

  homeNewsImageFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  carouselMoreCard: {
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3A3115',
    backgroundColor: COLORS.card,
  },

  carouselMoreIcon: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    backgroundColor: COLORS.gold,
  },

  carouselMoreText: {
    marginTop: 12,
    color: COLORS.gold,
    fontSize: 14,
    fontWeight: '800',
  },

  eventCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 14,
    marginRight: 14,
  },

  eventImage: {
    width: '100%',
    aspectRatio: 1.6,
    resizeMode: 'cover',
    borderRadius: 14,
    marginBottom: 12,
  },

  category: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: '700',
  },

  eventBody: { flex: 1 },
  eventMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  eventTag: { flexShrink: 1, color: COLORS.gold, fontSize: 11, fontWeight: '700', borderLeftWidth: 1, borderLeftColor: '#3A3115', paddingLeft: 10 },
  eventAccessBadge: { marginTop: 8 },
  eventTitle: {
    color: COLORS.white,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    marginBottom: 0,
  },

  freeBadge: {
    backgroundColor: COLORS.gold,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 10,
  },

  premiumSmallBadge: {
    backgroundColor: '#222222',
    borderWidth: 1,
    borderColor: COLORS.gold,
  },

  freeText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '700',
  },

  premiumSmallText: {
    color: COLORS.gold,
  },

  guideCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    overflow: 'hidden',
  },

  guideImage: {
    width: '100%',
    height: 180,
  },

  guideContent: {
    padding: 16,
  },

  guideTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },

  guideDate: {
    color: COLORS.secondary,
    marginTop: 6,
  },

  featureCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1F1F1F',
  },

  featureImage: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#080808',
  },

  featureContent: {
    padding: 16,
  },

  featureTag: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 8,
  },

  featureTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 23,
  },

  featureSubtitle: {
    color: COLORS.secondary,
    marginTop: 8,
    lineHeight: 20,
  },

  dropCard: {
    marginRight: 14,
    paddingBottom: 14,
  },
  dropImageContainer: { width: '100%', aspectRatio: 2.35, borderRadius: 14, overflow: 'hidden' },
  dropImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  dropContent: { paddingTop: 12 },
  dropMeta: { color: '#FDDD56', fontSize: 11, fontWeight: '600', marginBottom: 6 },
  dropTitle: { color: COLORS.white, fontSize: 23, lineHeight: 28, fontWeight: '700' },
  dropBadge: { position: 'absolute', top: 10, left: 10, backgroundColor: '#FDDD56', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  dropBadgeText: { color: '#000000', fontSize: 11, fontWeight: '800' },
});
