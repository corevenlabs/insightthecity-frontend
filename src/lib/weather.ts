export type CurrentWeather = {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  isDay: boolean;
  maxTemperature: number;
  minTemperature: number;
};

type WeatherResponse = {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    weather_code: number;
    is_day: number;
  };
  daily: {
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
};

const NYC_WEATHER_URL =
  'https://api.open-meteo.com/v1/forecast' +
  '?latitude=40.7128&longitude=-74.0060' +
  '&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day' +
  '&daily=temperature_2m_max,temperature_2m_min' +
  '&temperature_unit=fahrenheit&wind_speed_unit=mph' +
  '&timezone=America%2FNew_York&forecast_days=1';

const WEATHER_CACHE_MS = 10 * 60 * 1000;
let weatherCache: { data: CurrentWeather; expiresAt: number } | null = null;
let weatherRequest: Promise<CurrentWeather> | null = null;

export async function fetchCurrentWeather(): Promise<CurrentWeather> {
  if (weatherCache && weatherCache.expiresAt > Date.now()) return weatherCache.data;
  if (weatherRequest) return weatherRequest;

  weatherRequest = (async () => {
    const response = await fetch(NYC_WEATHER_URL);
    if (!response.ok) throw new Error('No se pudo cargar el clima.');
    const data = (await response.json()) as WeatherResponse;
    if (!data.current || !data.daily) throw new Error('El clima no está disponible.');

    const currentWeather = {
      temperature: data.current.temperature_2m,
      apparentTemperature: data.current.apparent_temperature,
      humidity: data.current.relative_humidity_2m,
      windSpeed: data.current.wind_speed_10m,
      weatherCode: data.current.weather_code,
      isDay: data.current.is_day === 1,
      maxTemperature: data.daily.temperature_2m_max[0],
      minTemperature: data.daily.temperature_2m_min[0],
    };

    weatherCache = { data: currentWeather, expiresAt: Date.now() + WEATHER_CACHE_MS };
    return currentWeather;
  })();

  try {
    return await weatherRequest;
  } finally {
    weatherRequest = null;
  }
}

export function weatherDescription(code: number): string {
  if (code === 0) return 'Cielo despejado';
  if (code <= 3) return 'Parcialmente nublado';
  if (code === 45 || code === 48) return 'Niebla';
  if (code >= 51 && code <= 57) return 'Llovizna';
  if (code >= 61 && code <= 67) return 'Lluvia';
  if (code >= 71 && code <= 77) return 'Nieve';
  if (code >= 80 && code <= 82) return 'Chubascos';
  if (code >= 85 && code <= 86) return 'Nieve intermitente';
  if (code >= 95) return 'Tormentas';
  return 'Condiciones variables';
}
