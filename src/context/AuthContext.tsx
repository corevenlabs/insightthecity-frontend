import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

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
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
  activatePremiumForDevelopment: () => Promise<User | null>;
};

const TOKEN_KEY = 'itc_token';
const USER_KEY = 'itc_user';
const DEV_PREMIUM_USER_KEY = 'itc_dev_premium_user';
const PREMIUM_SIMULATION_ENABLED =
  __DEV__ || process.env.EXPO_PUBLIC_ENABLE_PREMIUM_SIMULATION === 'true';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function persist(token: string, user: User) {
  await AsyncStorage.multiSet([
    [TOKEN_KEY, token],
    [USER_KEY, JSON.stringify(user)],
  ]);
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

  // Restaura la sesión guardada al arrancar y la refresca contra /me.
  useEffect(() => {
    (async () => {
      try {
        const [[, savedToken], [, savedUser]] = await AsyncStorage.multiGet([
          TOKEN_KEY,
          USER_KEY,
        ]);

        if (!savedToken) return;

        setToken(savedToken);
        if (savedUser) {
          const cachedUser = JSON.parse(savedUser) as User;
          const devPremiumUserId = await AsyncStorage.getItem(DEV_PREMIUM_USER_KEY);
          setUser(
            PREMIUM_SIMULATION_ENABLED && devPremiumUserId === String(cachedUser.id)
              ? { ...cachedUser, is_premium: true }
              : cachedUser
          );
        }

        // Revalida contra el backend; si el token expiró, cierra sesión.
        try {
          const res = await fetch(`${API_URL}/api/users/me`, {
            headers: { Authorization: `Bearer ${savedToken}` },
          });
          if (res.status === 401) {
            await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY, DEV_PREMIUM_USER_KEY]);
            setToken(null);
            setUser(null);
          } else if (res.ok) {
            const data = await res.json();
            if (data?.user) {
              const devPremiumUserId = await AsyncStorage.getItem(DEV_PREMIUM_USER_KEY);
              const refreshedUser =
                PREMIUM_SIMULATION_ENABLED && devPremiumUserId === String(data.user.id)
                  ? { ...data.user, is_premium: true }
                  : data.user;
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

  const signIn = useCallback(async (email: string, password: string) => {
    const { token: t, user: u } = await postAuth('/api/users/login', {
      email,
      password,
    });
    await persist(t, u);
    setToken(t);
    setUser(u);
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
    },
    []
  );

  const signOut = useCallback(async () => {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY, DEV_PREMIUM_USER_KEY]);
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) return null;
    try {
      const res = await fetch(`${API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY, DEV_PREMIUM_USER_KEY]);
        setToken(null);
        setUser(null);
        return null;
      }
      if (!res.ok) return null;
      const data = await res.json();
      if (!data?.user) return null;
      const devPremiumUserId = await AsyncStorage.getItem(DEV_PREMIUM_USER_KEY);
      const refreshedUser: User =
        PREMIUM_SIMULATION_ENABLED && devPremiumUserId === String(data.user.id)
          ? { ...data.user, is_premium: true }
          : data.user;
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
      signIn,
      signUp,
      signOut,
      refreshUser,
      activatePremiumForDevelopment,
    }),
    [user, token, loading, signIn, signUp, signOut, refreshUser, activatePremiumForDevelopment]
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
