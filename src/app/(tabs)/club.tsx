import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ClubScreen() {
  const benefits = [
    { icon: 'pricetag-outline', title: 'Ahorros y descuentos', subtitle: 'en atracciones, restaurantes y más.' },
    { icon: 'gift-outline', title: 'Experiencias exclusivas', subtitle: 'y giveaways.' },
    { icon: 'notifications-outline', title: 'Alertas de eventos y pop-ups', subtitle: 'antes que todos.' },
    { icon: 'flash-outline', title: 'City Drops', subtitle: 'por tiempo limitado.' },
    { icon: 'map-outline', title: 'Guías especiales', subtitle: 'creadas por expertos locales.' },
    { icon: 'star-outline', title: 'Acceso anticipado', subtitle: 'a eventos y experiencias.' },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* 🔥 HERO CON IMAGEN */}
      <ImageBackground
        source={{ uri: 'https://img.magnific.com/fotos-premium/vistas-nueva-york-empire-state-building-noche_772417-160.jpg' }}
        style={styles.hero}
        imageStyle={{ borderRadius: 0 }}
      >
        <Text style={styles.header}>
          ITC <Text style={styles.gold}>CLUB</Text>
        </Text>

        <Text style={styles.subtitle}>
          ACCESO EXCLUSIVO A{'\n'}
          LO MEJOR DE NYC Y NJ
        </Text>
      </ImageBackground>

      {/* CARD */}
      <View style={styles.card}>
        {benefits.map((item, index) => (
          <View
            key={index}
            style={[
              styles.benefitRow,
              index !== benefits.length - 1 && styles.separator,
            ]}
          >
            <View style={styles.iconContainer}>
              <Ionicons
                name={(item.icon.replace('-outline', '') as any)}
                size={20}
                color="#000"
              />
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.benefitTitle}>{item.title}</Text>
              <Text style={styles.benefitSubtitle}>{item.subtitle}</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={styles.joinButton}
          onPress={() => router.push('/club-form' as any)}
        >
          <Text style={styles.joinButtonText}>
            UNIRME AL CLUB
          </Text>
        </TouchableOpacity>

        <Text style={styles.price}>
          Desde <Text style={styles.priceBold}>$4.99</Text> / mes
        </Text>

        <Text style={styles.cancel}>
          Cancela cuando quieras.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },

  hero: {
  paddingTop: 80,
  paddingBottom: 60,
  alignItems: 'center',
  justifyContent: 'center',
},

  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },

  header: {
    color: '#FFFFFF',
    fontSize: 46,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 12,
  },

  gold: {
    color: '#D4AF37',
  },

  subtitle: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 30,
    opacity: 0.9,
  },

  card: {
    backgroundColor: '#111111',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#222222',
    padding: 20,
  marginTop : 20,
  },

  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },

  separator: {
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },

  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  textContainer: {
    flex: 1,
  },

  benefitTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },

  benefitSubtitle: {
    color: '#9A9A9A',
    fontSize: 13,
  },

  joinButton: {
    backgroundColor: '#D4AF37',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },

  joinButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },

  price: {
    textAlign: 'center',
    color: '#CFCFCF',
    marginTop: 18,
    fontSize: 14,
  },

  priceBold: {
    color: '#D4AF37',
    fontWeight: 'bold',
  },

  cancel: {
    textAlign: 'center',
    color: '#777777',
    fontSize: 12,
    marginTop: 6,
  },
});