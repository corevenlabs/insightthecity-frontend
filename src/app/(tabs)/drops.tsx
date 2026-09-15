import { MemberBenefitSummary } from '@/components/MemberBenefitSummary';
import { ExperienceTags } from '@/components/ExperienceTags';
import { TagFilter } from '@/components/TagFilter';
import { ExpandableText } from '@/components/ExpandableContent';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import type { Experience } from '../../constants/experiences';
import { getExperienceTags, matchesExperienceTags } from '../../lib/experienceFilters';
import { fetchExperiences } from '../../lib/experiences';

type MiniDropCardProps = { 
  id: string;
  image: string; 
  title: string; 
  subtitle: string;
  tags: string[];
  access: 'free' | 'premium';
  showBenefitOnCard?: boolean;
  cardBenefit?: string | null;
  isPremiumMember: boolean;
  region: 'NY' | 'NJ';
};

export default function DropsScreen() { 
  const router = useRouter(); 
  const { user } = useAuth();
  const { t } = useLanguage();
  const [items, setItems] = useState<Experience[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string[]>([]);

  useFocusEffect(useCallback(() => {
    void fetchExperiences('drops').then(setItems).catch(() => undefined);
  }, []));

  const filteredItems = useMemo(
    () => items.filter((item) => matchesExperienceTags(item, selectedFilter)),
    [items, selectedFilter],
  );
  const [featured, ...upcoming] = filteredItems;

  const openExperience = (id: string) => {
    router.push({
      pathname: '/experience-detail',
      params: { id },
    } as any);
  };

  return ( 
    <SafeAreaView style={styles.container}> 
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.content} 
      > 
        <View style={styles.header}> 
          <TouchableOpacity onPress={() => router.back()}> 
            <Ionicons name="arrow-back" size={26} color="#D4AF37" />
          </TouchableOpacity> 
          <Text style={styles.headerTitle}> 
            <Text style={styles.city}>CITY </Text> 
            <Text style={styles.drops}>DROPS</Text> 
          </Text> 
          <View style={{ width: 26 }} /> 
        </View> 

        <Text style={styles.subtitle}> 
          {t('drops.subtitle')}
        </Text> 

        <TagFilter items={items} selected={selectedFilter} onChange={setSelectedFilter} />

        {filteredItems.length === 0 && <Text style={styles.subtitle}>No hay contenidos con estas etiquetas.</Text>}

        {/* DROP PRINCIPAL */}
        {featured && <TouchableOpacity
          style={styles.heroCard}
          onPress={() => openExperience(featured.id)}
        > 
          <Image 
            source={{ uri: featured.image }}
            style={styles.heroImage} 
          /> 
          <View style={styles.overlay}> 
            <View style={styles.heroTopline}>
              <Text style={styles.badge}> {t('drops.featured')} </Text>
              <View style={styles.regionBadge}><Text style={styles.regionBadgeText}>{featured.region ?? 'NY'}</Text></View>
            </View>
            <ExperienceTags tags={getExperienceTags(featured)} />
            <Text style={styles.heroTitle}> {featured.title} </Text>
            <MemberBenefitSummary experience={featured} />
            <ExpandableText key={featured.id} text={featured.description} style={styles.heroDescription} color="#D4A017" />
            <Text style={styles.location}> 
              {featured.location}
            </Text> 
            <Text style={styles.endsIn}> {t('drops.endsIn')} </Text>
            <View style={styles.countdownContainer}> 
              <View style={styles.timeBox}> 
                <Text style={styles.timeNumber}>23</Text> 
                <Text style={styles.timeLabel}>HRS</Text> 
              </View> 
              <View style={styles.timeBox}> 
                <Text style={styles.timeNumber}>14</Text> 
                <Text style={styles.timeLabel}>MIN</Text> 
              </View> 
              <View style={styles.timeBox}> 
                <Text style={styles.timeNumber}>55</Text> 
                <Text style={styles.timeLabel}>SEC</Text> 
              </View> 
            </View> 
            <TouchableOpacity
              style={styles.claimButton}
              onPress={() => openExperience(featured.id)}
            > 
              <Text style={styles.claimButtonText}> {t('drops.detail')} </Text>
            </TouchableOpacity> 
          </View> 
        </TouchableOpacity>}

        {/* PROXIMOS DROPS */}
        <Text style={styles.sectionTitle}> {t('drops.upcoming')} </Text>

        {upcoming.map((item) => (
          <MiniDropCard key={item.id} id={item.id} image={item.image} title={item.title}
            subtitle={item.date || item.description} tags={getExperienceTags(item)} access={item.access} showBenefitOnCard={item.showBenefitOnCard} cardBenefit={item.cardBenefit}
            region={item.region ?? 'NY'}
            isPremiumMember={Boolean(user?.is_premium)} />
        ))}

        <View style={{ height: 100 }} /> 
      </ScrollView> 
    </SafeAreaView> 
  ); 
} 

function MiniDropCard({ id, image, title, subtitle, tags, access, showBenefitOnCard, cardBenefit, region, isPremiumMember }: MiniDropCardProps) {
  const router = useRouter();
  const { t } = useLanguage();

  const openExperience = () => {
    router.push({
      pathname: '/experience-detail',
      params: { id },
    } as any);
  };

  return ( 
    <TouchableOpacity style={styles.miniDropCard} onPress={openExperience}> 
      <Image source={{ uri: image }} style={styles.miniDropImage} /> 
      <View style={styles.miniDropContent}> 
        <View style={styles.miniTopline}>
          <View style={styles.regionBadge}><Text style={styles.regionBadgeText}>{region}</Text></View>
          <View style={[styles.accessPill, access === 'premium' && styles.premiumPill]}>
            <Text style={[styles.accessPillText, access === 'premium' && styles.premiumPillText]}>
              {access === 'premium' ? isPremiumMember ? 'ITC CLUB' : 'PREMIUM' : t('common.free')}
            </Text>
          </View>
        </View>
        <ExperienceTags tags={tags} />
        <Text style={styles.miniDropTitle}> {title} </Text>
        <MemberBenefitSummary experience={{ access, showBenefitOnCard, cardBenefit }} />
        <Text style={styles.miniDropSubtitle}> {subtitle} </Text> 
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
    paddingHorizontal: 20, 
    paddingTop: 20, 
  }, 
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginTop: 10, 
    marginBottom: 10, 
  }, 
  headerTitle: { 
    fontSize: 34, 
    fontWeight: '800', 
    textAlign: 'center', 
  }, 
  city: { 
    color: COLORS.white, 
  }, 
  drops: { 
    color: COLORS.gold, 
  }, 
  subtitle: { 
    color: COLORS.secondary, 
    textAlign: 'center', 
    marginTop: 10, 
    marginBottom: 25, 
  },
  tabsContainer: { marginBottom: 24 },
  tabsContent: { paddingRight: 10 },
  tab: { minHeight: 44, justifyContent: 'center', backgroundColor: '#1A1A1A', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, marginRight: 10 },
  activeTab: { backgroundColor: COLORS.gold },
  tabText: { color: COLORS.secondary, fontWeight: '600' },
  activeTabText: { color: COLORS.background },
  heroCard: { 
    minHeight: 400,
    borderRadius: 24, 
    overflow: 'hidden', 
    backgroundColor: COLORS.card, 
    marginBottom: 30, 
  }, 
  heroImage: { 
    width: '100%', 
    height: '100%', 
    position: 'absolute', 
  }, 
  overlay: { 
    flex: 1, 
    justifyContent: 'flex-end', 
    paddingHorizontal: 24, 
    paddingTop: 24, 
    paddingBottom: 50, 
    backgroundColor: 'rgba(0,0,0,0.55)', 
  }, 
  badge: { 
    color: COLORS.gold, 
    fontWeight: '700', 
  },
  heroTopline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  regionBadge: {
    minWidth: 38,
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: COLORS.gold,
  },
  regionBadgeText: { color: COLORS.background, fontSize: 11, fontWeight: '900' },
  heroTitle: { 
    color: COLORS.white, 
    fontSize: 32, 
    fontWeight: '800', 
  }, 
  heroDescription: { 
    color: COLORS.white, 
    marginTop: 0, 
    lineHeight: 22, 
  }, 
  location: { 
    color: COLORS.white, 
    fontSize: 14, 
    fontWeight: '600', 
    marginTop: 6, 
  }, 
  endsIn: { 
    color: COLORS.gold, 
    fontSize: 14, 
    fontWeight: '600', 
    marginTop: 24, 
    marginBottom: 12, 
  }, 
  countdownContainer: { 
    flexDirection: 'row', 
  }, 
  timeBox: { 
    width: 70, 
    height: 70, 
    borderRadius: 18, 
    backgroundColor: '#151515', 
    borderWidth: 1, 
    borderColor: '#252525', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 10, 
  }, 
  timeNumber: { 
    color: COLORS.white, 
    fontSize: 24, 
    fontWeight: '800', 
  }, 
  timeLabel: { 
    color: COLORS.secondary, 
    fontSize: 10, 
    marginTop: 4, 
  }, 
  claimButton: { 
    backgroundColor: COLORS.gold, 
    marginTop: 20, 
    paddingVertical: 14, 
    borderRadius: 14, 
    alignItems: 'center', 
  }, 
  claimButtonText: { 
    color: '#000', 
    fontWeight: '800', 
    fontSize: 14, 
  }, 
  sectionTitle: { 
    color: COLORS.white, 
    fontSize: 22, 
    fontWeight: '700', 
    marginBottom: 16, 
  }, 
  miniDropCard: { 
    backgroundColor: COLORS.card, 
    borderRadius: 18, 
    overflow: 'hidden', 
    marginBottom: 16, 
  }, 
  miniDropImage: { 
    width: '100%', 
    height: 180, 
  }, 
  miniDropContent: { 
    padding: 16, 
  },
  miniTopline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 9,
  },
  accessPill: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.gold,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  premiumPill: {
    backgroundColor: '#222222',
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  accessPillText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '800',
  },
  premiumPillText: {
    color: COLORS.gold,
  },
  miniDropTitle: { 
    color: COLORS.white, 
    fontSize: 18, 
    fontWeight: '700', 
  }, 
  miniDropSubtitle: { 
    color: COLORS.secondary, 
    marginTop: 6, 
  }, 
});
