import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';

type MiniDropCardProps = { 
  id: string;
  image: string; 
  title: string; 
  subtitle: string; 
  access: 'free' | 'premium';
  isPremiumMember: boolean;
};

export default function DropsScreen() { 
  const router = useRouter(); 
  const { user } = useAuth();

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
            <Ionicons name="arrow-back" size={26} color="#D4A017" /> 
          </TouchableOpacity> 
          <Text style={styles.headerTitle}> 
            <Text style={styles.city}>CITY </Text> 
            <Text style={styles.drops}>DROPS</Text> 
          </Text> 
          <View style={{ width: 26 }} /> 
        </View> 

        <Text style={styles.subtitle}> 
          Ofertas exclusivas por tiempo limitado 
        </Text> 

        {/* DROP PRINCIPAL */}
        <TouchableOpacity
          style={styles.heroCard}
          onPress={() => openExperience('summit-nyc-2x1')}
        > 
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1518391846015-55a9cc003b25' }} 
            style={styles.heroImage} 
          /> 
          <View style={styles.overlay}> 
            <Text style={styles.badge}> DESTACADO </Text> 
            <Text style={styles.heroTitle}> SUMMIT NYC </Text> 
            <Text style={styles.heroDescription}> 
              Consigue entradas 2x1 para una de las mejores vistas de Nueva York. 
            </Text> 
            <Text style={styles.location}> 
              📍 One Vanderbilt, Midtown Manhattan 
            </Text> 
            <Text style={styles.endsIn}> Termina en </Text> 
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
              onPress={() => openExperience('summit-nyc-2x1')}
            > 
              <Text style={styles.claimButtonText}> VER DETALLE </Text> 
            </TouchableOpacity> 
          </View> 
        </TouchableOpacity> 

        {/* PROXIMOS DROPS */}
        <Text style={styles.sectionTitle}> Próximos Drops </Text> 

        <MiniDropCard 
          id="broadway-week"
          image="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba" 
          title="Broadway Week" 
          subtitle="Tickets desde $49" 
          access="premium"
          isPremiumMember={Boolean(user?.is_premium)}
        /> 
        <MiniDropCard 
          id="rooftop-230-fifth"
          image="https://images.unsplash.com/photo-1514565131-fce0801e5785" 
          title="230 Fifth Rooftop" 
          subtitle="30% OFF cocktails" 
          access="premium"
          isPremiumMember={Boolean(user?.is_premium)}
        /> 
        <MiniDropCard 
          id="restaurant-week-nyc"
          image="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4" 
          title="Restaurant Week NYC" 
          subtitle="Menús especiales" 
          access="premium"
          isPremiumMember={Boolean(user?.is_premium)}
        /> 
        <MiniDropCard 
          id="museum-nights"
          image="https://images.unsplash.com/photo-1522083165195-3424ed129620" 
          title="Museum Nights" 
          subtitle="Entrada gratuita" 
          access="free"
          isPremiumMember={Boolean(user?.is_premium)}
        /> 
        <MiniDropCard 
          id="edge-observatory"
          image="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee" 
          title="Edge Observatory" 
          subtitle="25% OFF entradas" 
          access="premium"
          isPremiumMember={Boolean(user?.is_premium)}
        /> 

        <View style={{ height: 100 }} /> 
      </ScrollView> 
    </SafeAreaView> 
  ); 
} 

function MiniDropCard({ id, image, title, subtitle, access, isPremiumMember }: MiniDropCardProps) {
  const router = useRouter();

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
        <View style={[styles.accessPill, access === 'premium' && styles.premiumPill]}>
          <Text style={[styles.accessPillText, access === 'premium' && styles.premiumPillText]}>
            {access === 'premium' ? isPremiumMember ? 'ITC CLUB' : 'PREMIUM' : 'GRATIS'}
          </Text>
        </View>
        <Text style={styles.miniDropTitle}> {title} </Text> 
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
  heroCard: { 
    height: 400, 
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
    marginBottom: 10, 
  }, 
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
  accessPill: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.gold,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
    marginBottom: 9,
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
