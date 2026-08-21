import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Experience, experiences } from '@/constants/experiences';
import { useAuth } from '../../context/AuthContext';

// Primer nombre para el saludo ("Carlos Pérez" -> "Carlos").
function firstName(name: string | null, email?: string): string | null {
  if (name && name.trim()) return name.trim().split(/\s+/)[0];
  if (email) return email.split('@')[0];
  return null;
}

type EventCardProps = {
  experience: Experience;
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
  const name = firstName(user?.name ?? null, user?.email);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {name ? `Hola, ${name} 👋` : 'Hola 👋'}
            </Text>

            <Text style={styles.subtitle}>
              ¿Qué pasa hoy en NYC?
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

        <TouchableOpacity style={styles.heroCard}>
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
              Acceso anticipado a experiencias
              exclusivas, descuentos y más.
            </Text>

            <TouchableOpacity
              style={styles.joinBtn}
              onPress={() => router.push('/club-form')}
            >
              <Text style={styles.joinBtnText}>
                UNIRME AL CLUB
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* TOP DE HOY */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Top de hoy
          </Text>

          <TouchableOpacity
            onPress={() => router.push('/explore')}
          >
            <Text style={styles.seeMore}>
              Ver todo
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
        >

          {topToday.map((experience) => (
            <EventCard key={experience.id} experience={experience} />
          ))}
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
              Ver todo
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
        </ScrollView>

        {/* QUE HACER EN NY */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            ¿Qué hacer en NY?
          </Text>

          <TouchableOpacity onPress={() => router.push('/que-hacer' as any)}>
            <Text style={styles.seeMore}>Ver todo</Text>
          </TouchableOpacity>
        </View>

        <FeatureCard
          image="https://images.unsplash.com/photo-1501386761578-eac5c94b800a"
          tag="QUE HACER EN NY"
          title="Planes para esta semana en Nueva York"
          subtitle="Eventos, conciertos, cine al aire libre y experiencias para descubrir la ciudad."
          onPress={() => openExperience('ny-weekend-plans')}
        />

        {/* NY AL DIA */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            NY al día
          </Text>

          <TouchableOpacity onPress={() => router.push('/ny-al-dia' as any)}>
            <Text style={styles.seeMore}>Ver todo</Text>
          </TouchableOpacity>
        </View>

        <FeatureCard
          image="https://images.unsplash.com/photo-1522083165195-3424ed129620"
          tag="NUEVA YORK AL DÍA"
          title="Noticias y alertas que debes saber hoy"
          subtitle="Actualidad, transporte, clima, eventos masivos y cambios importantes en NYC/NJ."
          onPress={() => openExperience('ny-alerts-today')}
        />

        {/* GUIAS */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Guías
          </Text>

          <TouchableOpacity onPress={() => router.push('/guides')}>
            <Text style={styles.seeMore}>Ver todo</Text>
          </TouchableOpacity>
        </View>

        <FeatureCard
          image="https://images.unsplash.com/photo-1518391846015-55a9cc003b25"
          tag="GUÍA TURÍSTICA"
          title="Guías para vivir NYC como local"
          subtitle="Rutas, miradores, museos, rooftops y planes gratis para organizar tu viaje."
          onPress={() => openExperience('nyc-local-guides')}
        />

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function EventCard({ experience }: EventCardProps) {
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
          {experience.access === 'premium' ? 'PREMIUM' : 'GRATIS'}
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

  greeting: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: '700',
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
