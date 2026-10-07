import { StyleSheet, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useLanguage } from '../../context/LanguageContext';

export default function TabLayout() {
  const { t, ui } = useLanguage();
  const insets = useSafeAreaInsets();
  const { fontScale } = useWindowDimensions();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarLabelPosition: 'below-icon',
        tabBarActiveTintColor: '#FDDD56',
        tabBarInactiveTintColor: '#999999',
        tabBarStyle: {
          backgroundColor: '#0A0A0A',
          borderTopWidth: 1,
          borderTopColor: '#171717',
          height: 60 + Math.max(insets.bottom, 10) + Math.max(0, fontScale - 1) * 16,
          paddingBottom: Math.max(insets.bottom, 10),
          paddingTop: 7,
        },
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: t('tabs.explore'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="search-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="club"
        options={{
          title: ui('Beneficios'),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'gift' : 'gift-outline'} size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="saved"
        options={{
          title: ui('Guardados'),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'bookmark' : 'bookmark-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="drops"
        options={{ href: null }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
});
