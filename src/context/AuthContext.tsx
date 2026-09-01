import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState, Platform } from 'react-native';

import { API_URL } from '../constants/api';

export type User = {
  id: number;
  name: string | null;
  email: string;
  is_premium: boolean;
  created_at?: string;
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  /** true mientras se restaura la sesión guardada al abrir la app */
  loading: boolean;
  isAuthenticated: boolean;
  biometricAvailable: boolean;
  biometricEnabled: boolean;
  biometricLocked: boolean;
  biometricLabel: string;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  enableBiometric: () => Promise<boolean>;
  unlockWithBiometrics: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
  activatePremiumForDevelopment: () => Promise<User | null>;
};

const TOKEN_KEY = 'itc_token';
const USER_KEY = 'itc_user';
const BIOMETRIC_ENABLED_KEY = 'itc_biometric_enabled';
const LAST_BACKGROUND_AT_KEY = 'itc_last_background_at';
const BACKGROUND_LOCK_DELAY_MS = 30 * 60 * 1000;
const DEV_PREMIUM_USER_KEY = 'itc_dev_premium_user';
const PREMIUM_SIMULATION_ENABLED =
  __DEV__ || process.env.EXPO_PUBLIC_ENABLE_PREMIUM_SIMULATION === 'true';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function readToken() {
  if (Platform.OS === 'web') return AsyncStorage.getItem(TOKEN_KEY);
  return SecureStore.getItemAsync(TOKEN_KEY);
}

async function writeToken(token: string) {
  if (Platform.OS === 'web') return AsyncStorage.setItem(TOKEN_KEY, token);
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  // Limpia versiones anteriores, donde el JWT se guardaba sin cifrar.
  await AsyncStorage.removeItem(TOKEN_KEY);
}

async function deleteToken() {
  if (Platform.OS !== 'web') await SecureStore.deleteItemAsync(TOKEN_KEY);
  await AsyncStorage.removeItem(TOKEN_KEY);
}

async function persist(token: string, user: User) {
  await Promise.all([
    writeToken(token),
    AsyncStorage.setItem(USER_KEY, JSON.stringify(user)),
  ]);
}

async function restoreSimulatedPremium(user: User): Promise<User> {
  if (!PREMIUM_SIMULATION_ENABLED || user.is_premium) return user;
  const premiumUserId = await AsyncStorage.getItem(DEV_PREMIUM_USER_KEY);
  return premiumUserId === String(user.id) ? { ...user, is_premium: true } : user;
}

// Lanza un Error con el mensaje del backend para mostrarlo en pantalla.
async function postAuth(
  path: string,
  body: Record<string, unknown>
): Promise<{ token: string; user: User }> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Revisa tu conexión.');
  }

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // respuesta sin cuerpo JSON
  }

  if (!res.ok || !data?.success) {
    throw new Error(data?.message || 'Ocurrió un error. Inténtalo de nuevo.');
  }

  return { token: data.token, user: data.user };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricLocked, setBiometricLocked] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState('Biometría');
  const backgroundedAt = useRef<number | null>(null);

  // Restaura la sesión guardada al arrancar y la refresca contra /me.
  useEffect(() => {
    (async () => {
      try {
        let available = false;
        let label = 'Biometría';
        if (Platform.OS !== 'web') {
          const [hasHardware, enrolled, types] = await Promise.all([
            LocalAuthentication.hasHardwareAsync(),
            LocalAuthentication.isEnrolledAsync(),
            LocalAuthentication.supportedAuthenticationTypesAsync(),
          ]);
          available = hasHardware && enrolled;
          if (
            Platform.OS === 'ios' &&
            types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)
          ) {
            label = 'Face ID';
          }
        }
        setBiometricAvailable(available);
        setBiometricLabel(label);

        const [[, savedUser], [, biometricPreference], [, lastBackgroundAt]] = await AsyncStorage.multiGet([
          USER_KEY,
          BIOMETRIC_ENABLED_KEY,
          LAST_BACKGROUND_AT_KEY,
        ]);
        let savedToken = await readToken();

        // Migración transparente desde AsyncStorage para instalaciones existentes.
        if (!savedToken && Platform.OS !== 'web') {
          savedToken = await AsyncStorage.getItem(TOKEN_KEY);
          if (savedToken) await writeToken(savedToken);
        }

        if (!savedToken) return;

        const biometricsWereEnabled = biometricPreference === 'true';
        const backgroundTimestamp = Number(lastBackgroundAt);
        const wasInactiveLongEnough =
          lastBackgroundAt !== null &&
          Number.isFinite(backgroundTimestamp) &&
          Date.now() - backgroundTimestamp >= BACKGROUND_LOCK_DELAY_MS;
        setBiometricEnabled(biometricsWereEnabled);
        setBiometricLocked(biometricsWereEnabled && wasInactiveLongEnough);
        setToken(savedToken);
        if (savedUser) {
          const cachedUser = JSON.parse(savedUser) as User;
          setUser(await restoreSimulatedPremium(cachedUser));
        }

        // Revalida contra el backend; si el token expiró, cierra sesión.
        try {
          const res = await fetch(`${API_URL}/api/users/me`, {
            headers: { Authorization: `Bearer ${savedToken}` },
          });
          if (res.status === 401) {
            await Promise.all([
              deleteToken(),
              AsyncStorage.removeItem(USER_KEY),
            ]);
            setToken(null);
            setUser(null);
          } else if (res.ok) {
            const data = await res.json();
            if (data?.user) {
              const refreshedUser = await restoreSimulatedPremium(data.user);
              setUser(refreshedUser);
              await AsyncStorage.setItem(USER_KEY, JSON.stringify(refreshedUser));
            }
          }
          // otros errores (red/servidor): conservamos la sesión en caché
        } catch {
          // sin conexión: seguimos con los datos guardados
        }
      } catch {
        // storage ilegible: arrancamos sin sesión
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Bloquea una sesión protegida tras 30 minutos de inactividad.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        if (
          token &&
          biometricEnabled &&
          backgroundedAt.current !== null &&
          Date.now() - backgroundedAt.current >= BACKGROUND_LOCK_DELAY_MS
        ) {
          setBiometricLocked(true);
        }
        backgroundedAt.current = null;
        void AsyncStorage.setItem(LAST_BACKGROUND_AT_KEY, String(Date.now()));
      } else if (backgroundedAt.current === null) {
        const now = Date.now();
        backgroundedAt.current = now;
        void AsyncStorage.setItem(LAST_BACKGROUND_AT_KEY, String(now));
      }
    });
    return () => subscription.remove();
  }, [token, biometricEnabled]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { token: t, user: u } = await postAuth('/api/users/login', {
      email,
      password,
    });
    const restoredUser = await restoreSimulatedPremium(u);
    await persist(t, restoredUser);
    setToken(t);
    setUser(restoredUser);
    setBiometricLocked(false);
  }, []);

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const { token: t, user: u } = await postAuth('/api/users/register', {
        name,
        email,
        password,
      });
      await persist(t, u);
      setToken(t);
      setUser(u);
      setBiometricLocked(false);
    },
    []
  );

  const signOut = useCallback(async () => {
    await Promise.all([
      deleteToken(),
      AsyncStorage.multiRemove([
        USER_KEY,
        BIOMETRIC_ENABLED_KEY,
        LAST_BACKGROUND_AT_KEY,
      ]),
    ]);
    setToken(null);
    setUser(null);
    setBiometricEnabled(false);
    setBiometricLocked(false);
  }, []);

  const enableBiometric = useCallback(async () => {
    if (!biometricAvailable || Platform.OS === 'web') return false;
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: `Activar ${biometricLabel}`,
      cancelLabel: 'Ahora no',
      fallbackLabel: 'Usar código del dispositivo',
      biometricsSecurityLevel: 'strong',
    });
    if (!result.success) return false;
    await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
    await AsyncStorage.setItem(LAST_BACKGROUND_AT_KEY, String(Date.now()));
    setBiometricEnabled(true);
    setBiometricLocked(false);
    return true;
  }, [biometricAvailable, biometricLabel]);

  const unlockWithBiometrics = useCallback(async () => {
    if (!token || !biometricAvailable) {
      throw new Error(`${biometricLabel} no está disponible en este dispositivo.`);
    }
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: `Ingresar con ${biometricLabel}`,
      cancelLabel: 'Cancelar',
      fallbackLabel: 'Usar código del dispositivo',
      biometricsSecurityLevel: 'strong',
    });
    if (!result.success) {
      if (result.error === 'user_cancel' || result.error === 'system_cancel') {
        throw new Error('Autenticación cancelada.');
      }
      throw new Error(`No pudimos verificar tu ${biometricLabel}.`);
    }

    // Face ID desbloquea localmente y el servidor conserva la última palabra.
    try {
      const res = await fetch(`${API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        await Promise.all([
          deleteToken(),
          AsyncStorage.removeItem(USER_KEY),
        ]);
        setToken(null);
        setUser(null);
        setBiometricLocked(false);
        throw new Error('Tu sesión expiró. Ingresa nuevamente con tu contraseña.');
      }
      if (res.ok) {
        const data = await res.json();
        if (data?.user) {
          const restoredUser = await restoreSimulatedPremium(data.user);
          setUser(restoredUser);
          await AsyncStorage.setItem(USER_KEY, JSON.stringify(restoredUser));
        }
      }
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('Tu sesión expiró')) throw error;
      // Sin conexión conservamos el comportamiento offline que ya tenía la app.
    }
    setBiometricLocked(false);
    await AsyncStorage.setItem(LAST_BACKGROUND_AT_KEY, String(Date.now()));
  }, [token, biometricAvailable, biometricLabel]);

  const refreshUser = useCallback(async () => {
    if (!token) return null;
    try {
      const res = await fetch(`${API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        await Promise.all([
          deleteToken(),
          AsyncStorage.removeItem(USER_KEY),
        ]);
        setToken(null);
        setUser(null);
        return null;
      }
      if (!res.ok) return null;
      const data = await res.json();
      if (!data?.user) return null;
      const refreshedUser = await restoreSimulatedPremium(data.user);
      setUser(refreshedUser);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(refreshedUser));
      return refreshedUser;
    } catch {
      return null;
    }
  }, [token]);

  const activatePremiumForDevelopment = useCallback(async () => {
    if (!PREMIUM_SIMULATION_ENABLED) return null;
    const rawUser = await AsyncStorage.getItem(USER_KEY);
    if (!rawUser) return null;
    const premiumUser: User = { ...(JSON.parse(rawUser) as User), is_premium: true };
    await AsyncStorage.multiSet([
      [USER_KEY, JSON.stringify(premiumUser)],
      [DEV_PREMIUM_USER_KEY, String(premiumUser.id)],
    ]);
    setUser(premiumUser);
    return premiumUser;
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: !!token,
      biometricAvailable,
      biometricEnabled,
      biometricLocked,
      biometricLabel,
      signIn,
      signUp,
      signOut,
      enableBiometric,
      unlockWithBiometrics,
      refreshUser,
      activatePremiumForDevelopment,
    }),
    [
      user,
      token,
      loading,
      biometricAvailable,
      biometricEnabled,
      biometricLocked,
      biometricLabel,
      signIn,
      signUp,
      signOut,
      enableBiometric,
      unlockWithBiometrics,
      refreshUser,
      activatePremiumForDevelopment,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return ctx;
}
