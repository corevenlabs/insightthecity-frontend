import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useState, type ComponentProps } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Experience, experiences } from '@/constants/experiences';
import { NewsImage } from '../../components/NewsImage';
import { WeatherWidget } from '../../components/WeatherWidget';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { fetchNews, formatDate, type NewsCard } from '../../lib/news';
import {
  DEFAULT_FEATURED_PARTNERSHIP,
  fetchFeaturedPartnership,
  type FeaturedPartnership,
} from '../../lib/partnerships';
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

type EventCardProps = {
  experience: Experience;
  isPremiumMember: boolean;
};

type DropCardProps = {
  experience: Experience;
};

type FeatureCardProps = {
  image: string;
  title: string;
  subtitle: string;
  tag: string;
  onPress: () => void;
};

type CarouselMoreCardProps = {
  width: number;
  height: number;
  label: string;
  onPress: () => void;
};

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
  const { t } = useLanguage();
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

  const description = weatherDescription(weather.weatherCode);

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
        size={30}
        type="multicolor"
        tintColor={COLORS.gold}
        style={styles.headerWeatherSymbol}
        accessibilityLabel={description}
      />
      <Text style={styles.headerWeatherTemperature}>{Math.round(weather.temperature)}°</Text>
    </View>
  );
}

const topToday = experiences.filter((experience) =>
  ['central-park-concert', 'summit-nyc-2x1', 'ellens-stardust-diner'].includes(experience.id)
);

const homeDrops = experiences.filter((experience) =>
  ['summit-nyc-2x1', 'broadway-week', 'rooftop-230-fifth'].includes(experience.id)
);

function openExperience(id: string) {
  router.push({
    pathname: '/experience-detail',
    params: { id },
  } as any);
}

function CarouselMoreCard({ width, height, label, onPress }: CarouselMoreCardProps) {
  return (
    <TouchableOpacity
      style={[styles.carouselMoreCard, { width, height }]}
      activeOpacity={0.78}
      accessibilityRole="button"
      accessibilityLabel={`Ver más de ${label}`}
      onPress={onPress}
    >
      <View style={styles.carouselMoreIcon}>
        <Ionicons name="arrow-forward" size={24} color="#050505" />
      </View>
      <Text style={styles.carouselMoreText}>Ver más</Text>
    </TouchableOpacity>
  );
}

type HomeNewsSectionProps = {
  section: 'ny-al-dia' | 'que-hacer';
  title: string;
  route: '/ny-al-dia' | '/que-hacer';
};

function HomeNewsSection({ section, title, route }: HomeNewsSectionProps) {
  const { t } = useLanguage();
  const { width: windowWidth } = useWindowDimensions();
  const [items, setItems] = useState<NewsCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isNewsSection = section === 'ny-al-dia';
  const carouselCardWidth = Math.min(windowWidth - 76, 320);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const itemLimit = isNewsSection ? 5 : 4;
      const page = await fetchNews(section, 1, itemLimit);
      setItems(page.items.slice(0, itemLimit));
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo cargar el contenido.');
    } finally {
      setLoading(false);
    }
  }, [isNewsSection, section]);

  useEffect(() => {
    void load();
  }, [load]);

  const openArticle = (item: NewsCard) => {
    router.push({
      pathname: '/news-detail',
      params: { id: String(item.id), section: title },
    } as any);
  };

  const renderImage = (item: NewsCard, imageStyle: object) => (
    <NewsImage
      uri={item.image}
      style={imageStyle}
      accessibilityLabel={`Imagen de ${item.title}`}
    />
  );

  const renderNewsLayout = () => {
    const [featured, ...secondary] = items;

    return (
      <View>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`${featured.title}, ${formatDate(featured.date)}`}
          style={styles.newsFeaturedCard}
          onPress={() => openArticle(featured)}
          activeOpacity={0.82}
        >
          {renderImage(featured, styles.newsFeaturedImage)}
          <View style={styles.newsFeaturedOverlay}>
            <Text style={styles.newsFeaturedDate}>{formatDate(featured.date)}</Text>
            <Text style={styles.newsFeaturedTitle} numberOfLines={3}>{featured.title}</Text>
          </View>
        </TouchableOpacity>

        {secondary.slice(0, 4).map((item) => (
          <TouchableOpacity
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={`${item.title}, ${formatDate(item.date)}`}
            style={styles.newsCompactCard}
            onPress={() => openArticle(item)}
            activeOpacity={0.78}
          >
            {renderImage(item, styles.newsCompactImage)}
            <View style={styles.newsCompactContent}>
              <Text style={styles.newsCompactDate}>{formatDate(item.date)}</Text>
              <Text style={styles.newsCompactTitle} numberOfLines={3}>{item.title}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

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
      {items.map((item) => (
        <TouchableOpacity
          key={item.id}
          accessibilityRole="button"
          accessibilityLabel={`${item.title}, ${formatDate(item.date)}`}
          accessibilityHint="Abre los detalles del plan"
          style={[styles.planCarouselCard, { width: carouselCardWidth }]}
          onPress={() => openArticle(item)}
          activeOpacity={0.82}
        >
          {renderImage(item, styles.planCarouselImage)}
          <View style={styles.planCarouselOverlay}>
            <Text style={styles.planCarouselDate}>{formatDate(item.date)}</Text>
            <Text style={styles.planCarouselTitle} numberOfLines={3}>{item.title}</Text>
            {!!item.excerpt && (
              <Text style={styles.planCarouselExcerpt} numberOfLines={2}>{item.excerpt}</Text>
            )}
          </View>
        </TouchableOpacity>
      ))}
      <CarouselMoreCard
        width={carouselCardWidth}
        height={360}
        label={title}
        onPress={() => router.push(route as any)}
      />
    </ScrollView>
  );

  return (
    <View style={styles.newsSection}>
      <View style={styles.newsSectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`Ver todo: ${title}`}
          style={styles.newsSeeAllButton}
          onPress={() => router.push(route as any)}
          activeOpacity={0.7}
        >
          <Text style={styles.newsSeeAllText}>{t('common.seeAll')}</Text>
          <Ionicons name="arrow-forward" size={18} color={COLORS.gold} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.newsState} accessibilityLabel={`Cargando ${title}`}>
          <ActivityIndicator color={COLORS.gold} />
        </View>
      ) : error ? (
        <View style={styles.newsState}>
          <Ionicons name="cloud-offline-outline" size={28} color={COLORS.secondary} />
          <Text style={styles.newsError}>{error}</Text>
          <TouchableOpacity
            accessibilityRole="button"
            style={styles.retryButton}
            onPress={load}
            activeOpacity={0.72}
          >
            <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : items.length === 0 ? (
        <Text style={styles.emptyText}>Todavía no hay publicaciones en esta sección.</Text>
      ) : (
        isNewsSection ? renderNewsLayout() : renderPlansCarousel()
      )}
    </View>
  );
}

function DropCard({ experience }: DropCardProps) {
  return (
    <TouchableOpacity style={styles.dropCard} onPress={() => openExperience(experience.id)}>
      <Image
        source={{
          uri: experience.image,
        }}
        style={styles.dropImage}
      />

      <View style={styles.dropOverlay}>
        <Text style={styles.dropTitle}>
          {experience.title}
        </Text>

        <Text style={styles.dropOffer}>
          {experience.access === 'premium' ? 'Beneficio ITC Club' : 'Beneficio gratis'}
        </Text>

        <View style={styles.dropBadge}>
          <Text style={styles.dropBadgeText}>
            {experience.date}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const name = firstName(user?.name ?? null, user?.email);
  const [partnership, setPartnership] = useState<FeaturedPartnership | null>(
    DEFAULT_FEATURED_PARTNERSHIP,
  );

  useEffect(() => {
    let active = true;
    fetchFeaturedPartnership()
      .then((item) => {
        if (active) setPartnership(item);
      })
      .catch(() => {
        // Mientras el endpoint nuevo llega a producción, conservamos la muestra local.
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <View style={styles.greetingRow}>
              <Text style={styles.greeting} numberOfLines={1}>
                {name ? t('home.hello', { name }) : t('home.helloGuest')}
              </Text>
              <HeaderWeather />
            </View>

            <Text style={styles.subtitle}>
              {t('home.subtitle')}
            </Text>
          </View>

          <TouchableOpacity style={styles.notificationBtn}>
            <Ionicons
              name="notifications-outline"
              size={22}
              color="#FFF"
            />
          </TouchableOpacity>
        </View>

        {/* HERO CARD */}

        <View style={styles.heroCard}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2',
            }}
            style={styles.heroImage}
          />

          <View style={styles.heroOverlay}>
            <Text style={styles.clubTitle}>
              <Text style={styles.clubWhite}>ITC </Text>
              <Text style={styles.clubGold}>CLUB</Text>
            </Text>

            <Text style={styles.clubDescription}>
              {user?.is_premium
                ? 'Tus beneficios están activos. Descubre eventos, descuentos y experiencias para miembros.'
                : 'Descuentos, experiencias exclusivas, acceso anticipado y mucho más.'}
            </Text>

            <TouchableOpacity
              style={styles.joinBtn}
              onPress={() => router.push(user?.is_premium ? '/club' : '/club-form')}
            >
              <Text style={styles.joinBtnText}>
                {user?.is_premium ? 'VER MIS BENEFICIOS' : 'UNIRME AL CLUB'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {partnership && (
          <TouchableOpacity
            style={styles.partnershipCard}
            activeOpacity={partnership.ctaUrl ? 0.84 : 1}
            disabled={!partnership.ctaUrl}
            accessibilityRole={partnership.ctaUrl ? 'link' : undefined}
            accessibilityLabel={`${partnership.brandName}: ${partnership.title}`}
            onPress={() => {
              if (partnership.ctaUrl) void Linking.openURL(partnership.ctaUrl);
            }}
          >
            <NewsImage
              uri={partnership.image}
              style={styles.partnershipImage}
              accessibilityLabel={`Imagen de ${partnership.brandName}`}
            />
            <View style={styles.partnershipOverlay}>
              <View style={styles.partnershipLabel}>
                <Ionicons name="sparkles" size={12} color={COLORS.gold} />
                <Text style={styles.partnershipLabelText}>
                  PARTNERSHIP · {partnership.brandName.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.partnershipTitle} numberOfLines={2}>
                {partnership.title}
              </Text>
              {!!partnership.description && (
                <Text style={styles.partnershipDescription} numberOfLines={2}>
                  {partnership.description}
                </Text>
              )}
              {!!partnership.ctaLabel && (
                <View style={styles.partnershipCta}>
                  <Text style={styles.partnershipCtaText}>{partnership.ctaLabel}</Text>
                  {partnership.ctaUrl && (
                    <Ionicons name="arrow-forward" size={15} color="#050505" />
                  )}
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}

        {/* TOP DE HOY */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {t('home.topToday')}
          </Text>

          <TouchableOpacity
            onPress={() => router.push('/explore')}
          >
            <Text style={styles.seeMore}>
              {t('common.seeAll')}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
        >

          {topToday.map((experience) => (
            <EventCard
              key={experience.id}
              experience={experience}
              isPremiumMember={Boolean(user?.is_premium)}
            />
          ))}
          <CarouselMoreCard
            width={180}
            height={224}
            label="Top de hoy"
            onPress={() => router.push('/explore')}
          />
        </ScrollView>

        {/* DROPS */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Drops
          </Text>

          <TouchableOpacity
            onPress={() => router.push('/drops')}
          >
            <Text style={styles.seeMore}>
            {t('common.seeAll')}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {homeDrops.map((experience) => (
            <DropCard key={experience.id} experience={experience} />
          ))}
          <CarouselMoreCard
            width={180}
            height={160}
            label="Drops"
            onPress={() => router.push('/drops')}
          />
        </ScrollView>

        {/* NY AL DIA */}
        <HomeNewsSection
          section="ny-al-dia"
          title="NY al día"
          route="/ny-al-dia"
        />

        {/* QUE HACER EN NY */}
        <HomeNewsSection
          section="que-hacer"
          title="¿Qué hacer en NY?"
          route="/que-hacer"
        />

        {/* GUIAS */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {t('home.guides')}
          </Text>

          <TouchableOpacity onPress={() => router.push('/guides')}>
            <Text style={styles.seeMore}>{t('common.seeAll')}</Text>
          </TouchableOpacity>
        </View>

        <FeatureCard
          image="https://images.unsplash.com/photo-1518391846015-55a9cc003b25"
          tag="GUÍA TURÍSTICA"
          title="Guías para vivir NYC como local"
          subtitle="Rutas, miradores, museos, rooftops y planes gratis para organizar tu viaje."
          onPress={() => openExperience('nyc-local-guides')}
        />

        <WeatherWidget />

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function EventCard({ experience, isPremiumMember }: EventCardProps) {
  return (
    <TouchableOpacity style={styles.eventCard} onPress={() => openExperience(experience.id)}>
      <Image
        source={{
          uri: experience.image,
        }}
        style={styles.eventImage}
      />

      <Text style={styles.category}>
        {experience.category}
      </Text>

      <Text style={styles.eventTitle}>
        {experience.title}
      </Text>

      <Text style={styles.eventTime}>
        {experience.date}
      </Text>

      <View style={[styles.freeBadge, experience.access === 'premium' && styles.premiumSmallBadge]}>
        <Text style={[styles.freeText, experience.access === 'premium' && styles.premiumSmallText]}>
          {experience.access === 'premium'
            ? isPremiumMember ? 'ITC CLUB' : 'PREMIUM'
            : 'GRATIS'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function FeatureCard({
  image,
  title,
  subtitle,
  tag,
  onPress,
}: FeatureCardProps) {
  return (
    <TouchableOpacity style={styles.featureCard} onPress={onPress}>
      <Image source={{ uri: image }} style={styles.featureImage} />
      <View style={styles.featureContent}>
        <Text style={styles.featureTag}>{tag}</Text>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureSubtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
}

const COLORS = {
  background: '#050505',
  card: '#121212',
  gold: '#D4A017',
  white: '#FFFFFF',
  secondary: '#A6A6A6',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    padding: 20,
    paddingBottom: 120,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerCopy: {
    flex: 1,
    minWidth: 0,
    paddingRight: 12,
  },

  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  greeting: {
    flexShrink: 1,
    color: COLORS.white,
    fontSize: 28,
    fontWeight: '700',
  },

  headerWeatherBadge: {
    minWidth: 62,
    height: 36,
    flexDirection: 'row',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },

  headerWeatherSymbol: {
    width: 30,
    height: 30,
  },

  headerWeatherTemperature: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
  },

  subtitle: {
    color: COLORS.secondary,
    marginTop: 4,
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
    height: 238,
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
  color: '#D4A017',
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
    marginTop: 28,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  sectionTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '700',
  },

  seeMore: {
    color: COLORS.gold,
  },

  newsSection: {
    marginTop: 28,
  },

  newsSectionHeader: {
    marginBottom: 14,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },

  newsSeeAllButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 12,
  },

  newsSeeAllText: {
    color: COLORS.gold,
    fontSize: 14,
    fontWeight: '700',
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
    height: 360,
    overflow: 'hidden',
    marginRight: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    backgroundColor: COLORS.card,
  },

  planCarouselImage: {
    width: '100%',
    height: 190,
    backgroundColor: '#1A1A1A',
  },

  planCarouselOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 18,
    backgroundColor: COLORS.card,
  },

  planCarouselDate: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 7,
  },

  planCarouselTitle: {
    color: COLORS.white,
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '800',
  },

  planCarouselExcerpt: {
    color: '#D0D0D0',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
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
    width: 180,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 12,
    marginRight: 14,
  },

  eventImage: {
    width: '100%',
    height: 100,
    borderRadius: 12,
    marginBottom: 10,
  },

  category: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: '700',
  },

  eventTitle: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 6,
  },

  eventTime: {
    color: COLORS.secondary,
    marginTop: 4,
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
    height: 150,
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
    width: 260,
    height: 160,
    borderRadius: 18,
    overflow: 'hidden',
    marginRight: 14,
    backgroundColor: COLORS.card,
  },

  dropImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },

  dropOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  dropTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '700',
  },

  dropOffer: {
    color: COLORS.white,
    marginTop: 4,
  },

  dropBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.gold,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginTop: 10,
  },

  dropBadgeText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '700',
  },
});
