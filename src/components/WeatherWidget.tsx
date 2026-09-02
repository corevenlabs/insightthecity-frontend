import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useState, type ComponentProps } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  fetchCurrentWeather,
  weatherDescription,
  type CurrentWeather,
} from '../lib/weather';

const GOLD = '#D4A017';
const NYC_WEATHER_IMAGE =
  'https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?auto=format&fit=crop&w=1200&q=85';

function weatherIcon(code: number, isDay: boolean): ComponentProps<typeof Ionicons>['name'] {
  if (code === 0) return isDay ? 'sunny' : 'moon';
  if (code <= 3) return isDay ? 'partly-sunny' : 'cloudy-night';
  if (code === 45 || code === 48) return 'cloud';
  if (code >= 51 && code <= 67) return 'rainy';
  if (code >= 71 && code <= 77) return 'snow';
  if (code >= 80 && code <= 86) return code >= 85 ? 'snow' : 'rainy';
  if (code >= 95) return 'thunderstorm';
  return 'cloud-outline';
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      setWeather(await fetchCurrentWeather());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <View style={styles.section}>
      <View style={styles.headingRow}>
        <View>
          <Text style={styles.eyebrow}>NUEVA YORK AHORA</Text>
          <Text style={styles.heading}>Clima de hoy</Text>
        </View>
        <Ionicons name="location" size={20} color={GOLD} />
      </View>

      <ImageBackground
        source={{ uri: NYC_WEATHER_IMAGE }}
        style={styles.card}
        imageStyle={styles.cardImage}
        accessibilityLabel="Vista de Nueva York con el clima actual"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.10)', 'rgba(0,0,0,0.46)', 'rgba(0,0,0,0.94)']}
          locations={[0, 0.42, 1]}
          style={styles.cardOverlay}
        >
          {loading ? (
            <View style={styles.state} accessibilityLabel="Cargando clima actual">
              <ActivityIndicator color={GOLD} />
            </View>
          ) : error || !weather ? (
            <View style={styles.state}>
              <Ionicons name="cloud-offline-outline" size={30} color="#BDBDBD" />
              <Text style={styles.errorText}>No pudimos actualizar el clima.</Text>
              <TouchableOpacity
                style={styles.retry}
                onPress={load}
                accessibilityRole="button"
                activeOpacity={0.7}
              >
                <Text style={styles.retryText}>REINTENTAR</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.primaryRow}>
                <View style={styles.temperatureBlock}>
                  <Text style={styles.temperature}>{Math.round(weather.temperature)}°</Text>
                  <View style={styles.conditionRow}>
                    <Ionicons
                      name={weatherIcon(weather.weatherCode, weather.isDay)}
                      size={18}
                      color={GOLD}
                      accessibilityElementsHidden
                      importantForAccessibility="no-hide-descendants"
                    />
                    <Text style={styles.condition}>
                      {weatherDescription(weather.weatherCode)}
                    </Text>
                  </View>
                </View>
                <View style={styles.highLow}>
                  <Text style={styles.high}>↑ {Math.round(weather.maxTemperature)}°</Text>
                  <Text style={styles.low}>↓ {Math.round(weather.minTemperature)}°</Text>
                </View>
              </View>

              <View style={styles.detailsRow}>
                <WeatherDetail
                  icon="thermometer-outline"
                  label="Sensación"
                  value={`${Math.round(weather.apparentTemperature)}°`}
                />
                <WeatherDetail
                  icon="water-outline"
                  label="Humedad"
                  value={`${Math.round(weather.humidity)}%`}
                />
                <WeatherDetail
                  icon="navigate-outline"
                  label="Viento"
                  value={`${Math.round(weather.windSpeed)} mph`}
                />
              </View>
            </>
          )}
        </LinearGradient>
      </ImageBackground>
      <Text style={styles.source}>Datos meteorológicos: Open-Meteo</Text>
    </View>
  );
}

function WeatherDetail({
  icon,
  label,
  value,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detail}>
      <Ionicons
        name={icon}
        size={16}
        color={GOLD}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      />
      <Text style={styles.detailValue}>{value}</Text>
      <Text style={styles.detailLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 30 },
  headingRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  eyebrow: { color: GOLD, fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  heading: { color: '#FFF', fontSize: 24, fontWeight: '800', marginTop: 3 },
  card: {
    minHeight: 260,
    overflow: 'hidden',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: '#121212',
  },
  cardImage: { borderRadius: 24 },
  cardOverlay: { flex: 1, minHeight: 258, padding: 20, justifyContent: 'flex-end' },
  state: { flex: 1, minHeight: 218, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { color: '#E1E1E1', textAlign: 'center' },
  retry: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: GOLD,
  },
  retryText: { color: GOLD, fontSize: 11, fontWeight: '900' },
  primaryRow: { flexDirection: 'row', alignItems: 'flex-end' },
  temperatureBlock: { flex: 1 },
  temperature: { color: '#FFF', fontSize: 58, lineHeight: 62, fontWeight: '300' },
  conditionRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  condition: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  highLow: { alignItems: 'flex-end', gap: 6 },
  high: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  low: { color: '#D4D4D4', fontSize: 14, fontWeight: '700' },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginTop: 20 },
  detail: {
    flex: 1,
    minHeight: 66,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(5,5,5,0.52)',
  },
  detailValue: { color: '#FFF', fontSize: 14, fontWeight: '800' },
  detailLabel: { color: '#D0D0D0', fontSize: 10, fontWeight: '600' },
  source: { color: '#5F5F5F', fontSize: 9, textAlign: 'right', marginTop: 7 },
});
