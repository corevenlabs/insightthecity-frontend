import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useLanguage } from '../context/LanguageContext';

export function ScreenBackButton() {
  const { ui } = useLanguage();
  return <TouchableOpacity
    accessibilityRole="button"
    accessibilityLabel={ui('Volver')}
    style={styles.button}
    onPress={() => {
      if (router.canGoBack()) router.back();
      else router.replace('/home');
    }}
  ><Ionicons name="arrow-back" size={24} color="#FDDD56" /></TouchableOpacity>;
}
const styles = StyleSheet.create({ button: { width: 48, height: 48, flexShrink: 0, alignItems: 'center', justifyContent: 'center' } });
