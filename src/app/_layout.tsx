import { Ionicons } from '@expo/vector-icons';
import { Stack, usePathname, useRouter } from 'expo-router';
import * as Updates from 'expo-updates';
import { useEffect } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import {
  SplineSans_400Regular,
  SplineSans_500Medium,
  SplineSans_600SemiBold,
  SplineSans_700Bold,
  useFonts
} from '@expo-google-fonts/spline-sans';

import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';
import { BiometricLockScreen } from '../components/BiometricLockScreen';

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();

  const [fontsLoaded] = useFonts({
    SplineSans_400Regular,
    SplineSans_500Medium,
    SplineSans_600SemiBold,
    SplineSans_700Bold,
  });

  useEffect(() => {
    if (__DEV__ || !Updates.isEnabled) return;
    void Updates.checkForUpdateAsync()
      .then(async (update) => {
        if (!update.isAvailable) return;
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      })
      .catch(() => {
        // Una falla de actualización nunca debe impedir el acceso a la app instalada.
      });
  }, []);

  if (!fontsLoaded) return null;

  const hideChatButton = [
    '/welcome',
    '/login',
    '/register',
    '/chat',
    '/checkout',
    '/success',
  ].includes(pathname);

  return (
    <AuthProvider>
      <LanguageProvider>
        <Stack
          initialRouteName="welcome"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="welcome" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen
            name="(tabs)"
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen name="club-form" />
          <Stack.Screen name="chat" />
          <Stack.Screen name="checkout" />
          <Stack.Screen name="success" />
          <Stack.Screen name="guides" />
          <Stack.Screen name="que-hacer" />
          <Stack.Screen name="ny-al-dia" />
          <Stack.Screen name="news-detail" />
          <Stack.Screen name="experience-detail" />
        </Stack>

        {!hideChatButton && (
          <TouchableOpacity
            onPress={() => router.push('/chat')}
            style={styles.chatButton}
          >
            <Ionicons name="chatbubble-ellipses" size={24} color="#000" />
          </TouchableOpacity>
        )}
        <BiometricLockScreen />
      </LanguageProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  chatButton: {
    position: 'absolute',
    bottom: 85,
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    zIndex: 999,
  },
});
