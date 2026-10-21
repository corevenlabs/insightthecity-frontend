import AsyncStorage from '@react-native-async-storage/async-storage';
import { deleteAccountLocalData, resumeAccountLocalDeletion } from '../lib/accountLocalData';
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
import type { AppLanguage } from './LanguageContext';

export type ProfileUpdate = Partial<Pick<User, 'name' | 'language' | 'home_area' | 'interests'>>;

export type User = {
  has_password?: boolean;
  id: number;
  name: string | null;
  email: string;
  is_premium: boolean;
  language?: AppLanguage;
  created_at?: string;
  avatar_url?: string | null;
  home_area?: string;
  interests?: string[];
  // Copia de la suscripción en Stripe (la sincroniza el backend).
  subscription_status?: string | null;
  subscription_current_period_end?: string | null;
  subscription_cancel_at_period_end?: boolean;
  subscription_amount_cents?: number | null;
  subscription_currency?: string | null;
  subscription_interval?: string | null;
  has_billing_account?: boolean;
  // Permiso vigente para que el chat envíe datos a OpenAI.
  ai_chat_consent?: boolean;
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  /** true mientras se restaura la sesión guardada al abrir la app */
  loading: boolean;
  isAuthenticated: boolean;
  hasSignedOut: boolean;
  biometricAvailable: boolean;
  biometricEnabled: boolean;
  biometricLocked: boolean;
  biometricLabel: string;
  signInWithApple: (body: Record<string, unknown>) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  /** acceptLegal: el usuario marcó la casilla de Términos y Privacidad */
  signUp: (name: string, email: string, password: string, language: AppLanguage, acceptLegal: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  enableBiometric: () => Promise<boolean>;
  forgetBiometric: () => Promise<void>;
  unlockWithBiometrics: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
  updateProfile: (data: ProfileUpdate) => Promise<void>;
  uploadAvatar: (file: { uri: string; mimeType?: string | null; fileName?: string | null; file?: File; base64?: string | null }) => Promise<void>;
  /** Guarda un usuario devuelto por el servidor (p. ej. tras confirmar un pago). */
  applyServerUser: (user: User) => Promise<void>;
  /** Elimina la cuenta en el servidor (exige la contraseña) y cierra la sesión. */
  deleteAccount: (password: string) => Promise<void>;
};

const TOKEN_KEY = 'itc_token';
const USER_KEY = 'itc_user';
const BIOMETRIC_TOKEN_KEY = 'itc_biometric_token';
const BIOMETRIC_ENABLED_KEY = 'itc_biometric_enabled';
const LAST_BACKGROUND_AT_KEY = 'itc_last_background_at';
const BACKGROUND_LOCK_DELAY_MS = 30 * 60 * 1000;

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
    throw Object.assign(new Error(data?.message || 'Ocurrió un error. Inténtalo de nuevo.'), { code: data?.code });
  }

  return { token: data.token, user: data.user };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasSignedOut, setHasSignedOut] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricLocked, setBiometricLocked] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState('Biometría');
  const profileRevision = useRef(0);
  const backgroundedAt = useRef<number | null>(null);
  const biometricPromptActive = useRef(false);

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

        await resumeAccountLocalDeletion();
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

        // An enrollment is discoverable without reading its protected credential.
        setBiometricEnabled(biometricPreference === 'true');
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
          setUser(cachedUser);
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
            setBiometricLocked(false);
          } else if (res.ok) {
            const data = await res.json();
            if (data?.user) {
              const refreshedUser = data.user as User;
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
      if (!token) return;
      if (nextState === 'active') {
        if (
          biometricEnabled &&
          !biometricPromptActive.current &&
          backgroundedAt.current !== null &&
          Date.now() - backgroundedAt.current >= BACKGROUND_LOCK_DELAY_MS
        ) {
          setBiometricLocked(true);
        }
        backgroundedAt.current = null;
        void AsyncStorage.setItem(LAST_BACKGROUND_AT_KEY, String(Date.now()));
      } else if (nextState === 'background' && backgroundedAt.current === null) {
        const now = Date.now();
        backgroundedAt.current = now;
        void AsyncStorage.setItem(LAST_BACKGROUND_AT_KEY, String(now));
      }
    });
    return () => subscription.remove();
  }, [token, biometricEnabled]);

  const forgetBiometric = useCallback(async () => {
    profileRevision.current += 1;
    if (Platform.OS !== 'web') await SecureStore.deleteItemAsync(BIOMETRIC_TOKEN_KEY);
    await AsyncStorage.removeItem(BIOMETRIC_ENABLED_KEY);
    setBiometricEnabled(false);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { token: t, user: u } = await postAuth('/api/users/login', {
      email,
      password,
    });
    await forgetBiometric();
    await persist(t, u);
    setHasSignedOut(false);
    setToken(t);
    setUser(u);
    setBiometricLocked(false);
  }, [forgetBiometric]);

  const signInWithApple = useCallback(async (body: Record<string, unknown>) => {
    const { token: t, user: u } = await postAuth('/api/users/apple/login', body);
    await forgetBiometric();
    await persist(t, u);
    setHasSignedOut(false);
    setToken(t);
    setUser(u);
    setBiometricLocked(false);
  }, [forgetBiometric]);

  const signUp = useCallback(
    async (name: string, email: string, password: string, language: AppLanguage, acceptLegal: boolean) => {
      const { token: t, user: u } = await postAuth('/api/users/register', {
        name,
        email,
        password,
        language,
        acceptLegal,
      });
      await forgetBiometric();
      await persist(t, u);
      setHasSignedOut(false);
      setToken(t);
      setUser(u);
      setBiometricLocked(false);
    },
    [forgetBiometric]
  );

  const signOut = useCallback(async () => {
    setHasSignedOut(true);
    profileRevision.current += 1;
    await Promise.all([
      deleteToken(),
      AsyncStorage.multiRemove([
        USER_KEY,
        LAST_BACKGROUND_AT_KEY,
      ]),
    ]);
    setToken(null);
    setUser(null);
    setBiometricLocked(false);
  }, []);

  const enableBiometric = useCallback(async () => {
    if (!biometricAvailable || Platform.OS === 'web') return false;
    const activeToken = await readToken();
    if (!activeToken) return false;
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: `Activar ${biometricLabel}`,
      cancelLabel: 'Ahora no',
      fallbackLabel: 'Usar código del dispositivo',
      biometricsSecurityLevel: 'strong',
    });
    if (!result.success) return false;
    await SecureStore.setItemAsync(BIOMETRIC_TOKEN_KEY, activeToken, {
      requireAuthentication: true,
      authenticationPrompt: `Activar ${biometricLabel}`,
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
    await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
    await AsyncStorage.setItem(LAST_BACKGROUND_AT_KEY, String(Date.now()));
    setBiometricEnabled(true);
    setBiometricLocked(false);
    return true;
  }, [biometricAvailable, biometricLabel]);

  const unlockWithBiometrics = useCallback(async () => {
    if (!biometricEnabled || !biometricAvailable || Platform.OS === 'web') {
      throw new Error(`${biometricLabel} no está disponible en este dispositivo.`);
    }
    if (biometricPromptActive.current) throw new Error('La verificación ya está en curso.');
    biometricPromptActive.current = true;
    const revision = profileRevision.current;
    try {
      const savedToken = await SecureStore.getItemAsync(BIOMETRIC_TOKEN_KEY, {
        requireAuthentication: true,
        authenticationPrompt: `Ingresar con ${biometricLabel}`,
      });
      if (!savedToken) {
        await forgetBiometric();
        throw new Error('Activa nuevamente el acceso biométrico iniciando sesión con tu contraseña.');
      }
      const res = await fetch(`${API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${savedToken}` },
      });
      if (res.status === 401 || res.status === 403) {
        await forgetBiometric();
        await deleteToken();
        await AsyncStorage.removeItem(USER_KEY);
        setToken(null);
        setUser(null);
        setBiometricLocked(false);
        throw new Error('Tu sesión expiró. Ingresa nuevamente con tu contraseña.');
      }
      if (!res.ok) throw new Error('No se pudo verificar tu cuenta. Inténtalo nuevamente.');
      const data = await res.json();
      if (!data?.user) throw new Error('No se pudo verificar tu cuenta.');
      // A concurrent logout/forget must not be undone by a late server response.
      if (revision !== profileRevision.current) throw new Error('Autenticación cancelada.');
      await persist(savedToken, data.user);
      setHasSignedOut(false);
      setToken(savedToken);
      setUser(data.user);
      setBiometricLocked(false);
      await AsyncStorage.setItem(LAST_BACKGROUND_AT_KEY, String(Date.now()));
    } finally {
      biometricPromptActive.current = false;
    }
  }, [biometricAvailable, biometricEnabled, biometricLabel, forgetBiometric]);

  const refreshUser = useCallback(async () => {
    if (!token) return null;
    const revision = profileRevision.current;
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
        return null;
      }
      if (!res.ok) return null;
      const data = await res.json();
      if (!data?.user || revision !== profileRevision.current) return null;
      const refreshedUser = data.user as User;
      setUser(refreshedUser);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(refreshedUser));
      return refreshedUser;
    } catch {
      return null;
    }
  }, [token]);

  const applyServerUser = useCallback(async (serverUser: User) => {
    profileRevision.current += 1;
    setUser(serverUser);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(serverUser)).catch(() => undefined);
  }, []);

  const deleteAccount = useCallback(async (password: string) => {
    if (!token) throw new Error('Inicia sesión para eliminar tu cuenta');
    let response: Response;
    try {
      response = await fetch(`${API_URL}/api/users/me`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
    } catch {
      throw new Error('No se pudo conectar con el servidor. Revisa tu conexión.');
    }
    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.success) throw new Error(data?.message || 'No se pudo eliminar la cuenta.');
    const deletedId = user?.id;
    await forgetBiometric();
    await signOut();
    if (deletedId != null) await deleteAccountLocalData(deletedId);
  }, [token, signOut, forgetBiometric, user?.id]);

  const saveProfileResponse = useCallback(async (response: Response) => {
    const data = await response.json();
    if (!response.ok || !data?.success || !data?.user) throw new Error(data?.message || 'No se pudo actualizar el perfil');
    profileRevision.current += 1;
    setUser(data.user);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user)).catch(() => undefined);
  }, []);

  const updateProfile = useCallback(async (data: ProfileUpdate) => {
    profileRevision.current += 1;
    if (!token) throw new Error('Inicia sesión para editar tu perfil');
    await saveProfileResponse(await fetch(`${API_URL}/api/users/me`, {
      method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    }));
  }, [token, saveProfileResponse]);

  const uploadAvatar = useCallback(async (file: { uri: string; mimeType?: string | null; fileName?: string | null; file?: File; base64?: string | null }) => {
    if (!token) throw new Error('Inicia sesión para editar tu perfil');
    const form = new FormData();
    if (Platform.OS === 'web') {
      const blob = file.file || await (await fetch(file.uri)).blob();
      form.append('file', blob, file.fileName || 'avatar.jpg');
    } else {
      if (!file.base64) throw new Error('No se pudo leer la foto seleccionada');
      // Expo 56 no admite partes FormData con { uri, name, type }.
      form.append('jpegBase64', file.base64);
    }
    await saveProfileResponse(await fetch(`${API_URL}/api/users/me/avatar`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form,
    }));
  }, [token, saveProfileResponse]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: !!token,
      hasSignedOut,
      biometricAvailable,
      biometricEnabled,
      biometricLocked,
      biometricLabel,
      signIn,
      signInWithApple,
      signUp,
      signOut,
      enableBiometric,
      forgetBiometric,
      unlockWithBiometrics,
      refreshUser,
      updateProfile,
      uploadAvatar,
      applyServerUser,
      deleteAccount,
    }),
    [
      user,
      token,
      loading,
      hasSignedOut,
      biometricAvailable,
      biometricEnabled,
      biometricLocked,
      biometricLabel,
      signIn,
      signInWithApple,
      signUp,
      signOut,
      enableBiometric,
      forgetBiometric,
      unlockWithBiometrics,
      refreshUser,
      updateProfile,
      uploadAvatar,
      applyServerUser,
      deleteAccount,
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
