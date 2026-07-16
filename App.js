// App.js (en la raíz, junto a la carpeta src)
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import ClubScreen from './src/screens/ClubScreen';
import DropsScreen from './src/screens/DropsScreen';
import EventsScreen from './src/screens/EventsScreen';
import GuidesScreen from './src/screens/GuidesScreen';
import HomeScreen from './src/screens/HomeScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Inicio') iconName = focused ? 'home' : 'home-outline';
            else if (route.name === 'Explorar') iconName = focused ? 'search' : 'search-outline';
            else if (route.name === 'Drops') iconName = focused ? 'flash' : 'flash-outline';
            else if (route.name === 'Guías') iconName = focused ? 'book' : 'book-outline';
            else if (route.name === 'Club') iconName = focused ? 'people' : 'people-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#000',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
        })}
      >
        <Tab.Screen name="Inicio" component={HomeScreen} />
        <Tab.Screen name="Explorar" component={EventsScreen} />
        <Tab.Screen name="Drops" component={DropsScreen} />
        <Tab.Screen name="Guías" component={GuidesScreen} />
        <Tab.Screen name="Club" component={ClubScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}