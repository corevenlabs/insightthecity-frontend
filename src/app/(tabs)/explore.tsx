import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type EventType = {
  id: number;
  experienceId: string;
  title: string;
  location: string;
  time: string;
  category: string;
  filter: string;
  free: boolean;
  image: string;
};

const events: EventType[] = [
  {
    id: 1,
    experienceId: 'central-park-concert',
    title: 'Concierto en Central Park',
    location: 'Central Park',
    time: 'Hoy · 7:00 PM',
    category: 'Música',
    filter: 'Hoy',
    free: true,
    image:
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a',
  },
  {
    id: 2,
    experienceId: 'broadway-week',
    title: 'Broadway Week',
    location: 'Times Square',
    time: 'Este fin de semana',
    category: 'Broadway',
    filter: 'Este fin de semana',
    free: false,
    image:
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba',
  },
  {
    id: 3,
    experienceId: 'restaurant-week-nyc',
    title: 'Restaurant Week NYC',
    location: 'Manhattan',
    time: 'Todo el mes',
    category: 'Food',
    filter: 'Todos',
    free: false,
    image:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
  },
  {
    id: 4,
    experienceId: 'jazz-night-brooklyn',
    title: 'Jazz Night Brooklyn',
    location: 'Brooklyn',
    time: 'Hoy · 9 PM',
    category: 'Música',
    filter: 'Hoy',
    free: true,
    image:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
  },
  {
    id: 5,
    experienceId: 'summit-nyc-2x1',
    title: 'SUMMIT NYC 2x1',
    location: 'Midtown',
    time: '48 horas',
    category: 'Arte',
    filter: 'Todos',
    free: false,
    image:
      'https://images.unsplash.com/photo-1518391846015-55a9cc003b25',
  },
  {
    id: 6,
    experienceId: 'moma-late-fridays',
    title: 'MoMA Late Fridays',
    location: 'MoMA',
    time: 'Viernes',
    category: 'Arte',
    filter: 'Este fin de semana',
    free: true,
    image:
      'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b',
  },
  {
    id: 7,
    experienceId: 'comedy-cellar',
    title: 'Comedy Cellar',
    location: 'Greenwich Village',
    time: '8:30 PM',
    category: 'Nightlife',
    filter: 'Hoy',
    free: false,
    image:
      'https://images.unsplash.com/photo-1527224857830-43a7acc85260',
  },
  {
    id: 8,
    experienceId: 'hamilton-broadway',
    title: 'Hamilton',
    location: 'Broadway',
    time: '7 PM',
    category: 'Broadway',
    filter: 'Todos',
    free: false,
    image:
      'https://images.unsplash.com/photo-1503095396549-807759245b35',
  },
  {
    id: 9,
    experienceId: 'lion-king-broadway',
    title: 'The Lion King',
    location: 'Broadway',
    time: '8 PM',
    category: 'Broadway',
    filter: 'Todos',
    free: false,
    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
  },
  {
    id: 10,
    experienceId: 'brooklyn-flea',
    title: 'Brooklyn Flea',
    location: 'Brooklyn',
    time: 'Sábado',
    category: 'Food',
    filter: 'Este fin de semana',
    free: true,
    image:
      'https://images.unsplash.com/photo-1488459716781-31db52582fe9',
  },
  {
    id: 11,
    experienceId: 'rooftop-sunset-party',
    title: 'Rooftop Sunset Party',
    location: 'Manhattan',
    time: '6 PM',
    category: 'Nightlife',
    filter: 'Hoy',
    free: false,
    image:
      'https://images.unsplash.com/photo-1514565131-fce0801e5785',
  },
  {
    id: 12,
    experienceId: 'chelsea-market-tour',
    title: 'Chelsea Market Tour',
    location: 'Chelsea',
    time: '12 PM',
    category: 'Food',
    filter: 'Todos',
    free: false,
    image:
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
  },
];

const tabs = [
  'Todos',
  'Hoy',
  'Este fin de semana',
  'Gratis',
  'Música',
  'Broadway',
  'Food',
  'Arte',
  'Nightlife',
];

export default function ExploreScreen() {
 const router = useRouter();
  const [selectedTab, setSelectedTab] = useState('Todos');
  const [search, setSearch] = useState('');

  const openExperience = (id: string) => {
    router.push({
      pathname: '/experience-detail',
      params: { id },
    } as any);
  };

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        event.title
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        event.location
          .toLowerCase()
          .includes(search.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedTab === 'Todos') return true;

      if (selectedTab === 'Gratis') {
        return event.free;
      }

      if (
        selectedTab === 'Hoy' ||
        selectedTab === 'Este fin de semana'
      ) {
        return event.filter === selectedTab;
      }

      return event.category === selectedTab;
    });
  }, [selectedTab, search]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* HEADER CON BACK */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={26} color="#D4AF37" />
          </TouchableOpacity>

          <Text style={styles.title}>Explorar NYC</Text>

          <View style={{ width: 26 }} />
        </View>

        {/* SEARCH */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#999" />

          <TextInput
            placeholder="Buscar eventos..."
            placeholderTextColor="#777"
            style={styles.input}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* TABS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                selectedTab === tab && styles.activeTab,
              ]}
              onPress={() => setSelectedTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === tab && styles.activeTabText,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.results}>
          {filteredEvents.length} eventos encontrados
        </Text>

        {/* EVENTS */}
        {filteredEvents.map((event) => (
          <TouchableOpacity
            key={event.id}
            style={styles.card}
            onPress={() => openExperience(event.experienceId)}
          >
            <Image source={{ uri: event.image }} style={styles.image} />

            <View style={styles.cardContent}>
              <View style={styles.topRow}>
                <Text style={styles.category}>{event.category}</Text>

                <View
                  style={[
                    styles.badge,
                    event.free ? styles.freeBadge : styles.premiumBadge,
                  ]}
                >
                  <Text style={[styles.badgeText, !event.free && styles.premiumBadgeText]}>
                    {event.free ? 'GRATIS' : 'PREMIUM'}
                  </Text>
                </View>
              </View>

              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.location}>📍 {event.location}</Text>
              <Text style={styles.time}>{event.time}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
    paddingHorizontal: 20,
  },

  header: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: 10,
},

title: {
  color: '#FFF',
  fontSize: 32,
  fontWeight: '700',
},

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    borderRadius: 14,
    paddingHorizontal: 14,
    marginTop: 20,
    marginBottom: 20,
  },

  input: {
    flex: 1,
    color: '#FFF',
    paddingVertical: 14,
    marginLeft: 10,
  },

  tabsContainer: {
    marginBottom: 15,
  },

  tab: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },

  activeTab: {
    backgroundColor: '#D4AF37',
  },

  tabText: {
    color: '#AAA',
    fontWeight: '600',
  },

  activeTabText: {
    color: '#000',
  },

  results: {
    color: '#888',
    marginBottom: 15,
  },

  card: {
    backgroundColor: '#121212',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 18,
  },

  image: {
    width: '100%',
    height: 180,
  },

  cardContent: {
    padding: 16,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  category: {
    color: '#D4AF37',
    fontWeight: '700',
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  freeBadge: {
    backgroundColor: '#D4AF37',
  },

  premiumBadge: {
    backgroundColor: '#303030',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },

  badgeText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '700',
  },

  premiumBadgeText: {
    color: '#D4AF37',
  },

  eventTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 10,
  },

  location: {
    color: '#AAA',
    marginTop: 8,
  },

  time: {
    color: '#AAA',
    marginTop: 4,
  },
});
