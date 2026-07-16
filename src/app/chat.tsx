import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getLocation } from '../../services/location';

type Message =
  | {
      id: string;
      from: 'user' | 'bot';
      type: 'text';
      text: string;
    }
  | {
      id: string;
      from: 'bot';
      type: 'places';
      places: any[];
    };

export default function ChatScreen() {
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'text',
      text: 'Hola 👋 Pregúntame por lugares cercanos',
      from: 'bot',
    },
  ]);

  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userText = input;
    const location = await getLocation();

    setMessages((prev) => [
      { id: Date.now().toString(), type: 'text', text: userText, from: 'user' },
      ...prev,
    ]);

    setInput('');

    try {
      const res = await fetch('http://192.168.1.91:3000/api/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          lat: location?.lat,
          lng: location?.lng,
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        {
          id: (Date.now() + 1).toString(),
          type: 'places',
          from: 'bot',
          places: data.places?.slice(0, 5) || [],
        },
        ...prev,
      ]);
    } catch (error) {
      setMessages((prev) => [
        {
          id: Date.now().toString(),
          type: 'text',
          text: 'Error conectando con el servidor 😢',
          from: 'bot',
        },
        ...prev,
      ]);
    }
  };

  const openGoogleMaps = (lat: number, lng: number) => {
    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    );
  };

  const openWaze = (lat: number, lng: number) => {
    Linking.openURL(`https://waze.com/ul?ll=${lat},${lng}&navigate=yes`);
  };

  const renderItem = ({ item }: { item: Message }) => {
    if (item.type === 'places') {
      return (
        <View style={styles.botBubble}>
          {item.places.map((place: any, index: number) => {
            const lat = place.location.latitude;
            const lng = place.location.longitude;

            return (
              <View key={index} style={styles.placeCard}>
                <View style={styles.placeHeader}>
                  <Ionicons name="location" size={18} color="#D4AF37" />
                  <Text style={styles.placeTitle}>
                    {place.displayName?.text}
                  </Text>
                </View>

                <Text style={styles.placeAddress}>
                  {place.formattedAddress}
                </Text>

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    onPress={() => openGoogleMaps(lat, lng)}
                    style={[styles.actionBtn, styles.mapsBtn]}
                  >
                    <Ionicons name="map" size={16} color="#D4AF37" />
                    <Text style={styles.btnText}>Maps</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => openWaze(lat, lng)}
                    style={[styles.actionBtn, styles.wazeBtn]}
                  >
                    <Ionicons name="navigate" size={16} color="#D4AF37" />
                    <Text style={styles.btnText}>Waze</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      );
    }

    return (
      <View
        style={[
          styles.message,
          item.from === 'user' ? styles.userMsg : styles.botMsg,
        ]}
      >
        <Text style={item.from === 'user' ? styles.userText : styles.botText}>
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#D4AF37" />
          </TouchableOpacity>

          <Text style={styles.title}>
            <Text style={{ color: '#fff' }}>City </Text>
            <Text style={{ color: '#D4AF37' }}>Guide</Text>
          </Text>

          <View style={{ width: 24 }} />
        </View>

        {/* CHAT */}
        <FlatList
          data={messages}
          renderItem={renderItem}
          inverted
          contentContainerStyle={styles.chat}
        />

        {/* INPUT */}
        <View style={styles.inputBar}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Busca cafés, restaurantes..."
            placeholderTextColor="#777"
            style={styles.input}
          />

          <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
            <Ionicons name="send" size={18} color="#000" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ---------------- STYLES PRO ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },

  title: {
    fontSize: 20,
    fontWeight: '800',
  },

  chat: {
    padding: 16,
  },

  message: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
    maxWidth: '85%',
  },

  userMsg: {
    backgroundColor: '#D4AF37',
    alignSelf: 'flex-end',
  },

  botMsg: {
    backgroundColor: '#1A1A1A',
    alignSelf: 'flex-start',
  },

  userText: {
    color: '#000',
    fontWeight: '600',
  },

  botText: {
    color: '#fff',
  },

  botBubble: {
    backgroundColor: '#111',
    padding: 10,
    borderRadius: 18,
  },

  placeCard: {
    backgroundColor: '#0E0E0E',
    padding: 12,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1F1F1F',
  },

  placeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  placeTitle: {
    color: '#fff',
    fontWeight: '700',
    marginLeft: 6,
  },

  placeAddress: {
    color: '#999',
    fontSize: 12,
    marginBottom: 10,
  },

  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },

  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    gap: 6,
  },

  mapsBtn: {
  backgroundColor: '#0E0E0E',
  borderWidth: 1,
  borderColor: '#D4AF37',
},

wazeBtn: {
  backgroundColor: '#0E0E0E',
  borderWidth: 1,
  borderColor: '#D4AF37',
},

  btnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  inputBar: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
  },

  input: {
    flex: 1,
    backgroundColor: '#121212',
    borderRadius: 12,
    paddingHorizontal: 14,
    color: '#fff',
  },

  sendBtn: {
    marginLeft: 10,
    backgroundColor: '#D4AF37',
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
});