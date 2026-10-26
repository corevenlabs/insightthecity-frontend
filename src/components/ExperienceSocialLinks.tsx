import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { Text } from './typography';
import { useLanguage } from '../context/LanguageContext';
import { experienceSocialLinks, type SocialUrls } from '../lib/experienceSocialLinks';

export function ExperienceSocialLinks({ experience }: { experience: SocialUrls }) {
  const { ui } = useLanguage();
  const links = experienceSocialLinks(experience);
  if (!links.length) return null;
  return <View style={styles.container}>
    <Text style={styles.label}>{ui('Redes sociales')}</Text>
    <View style={styles.row}>
      {links.map(link => <Pressable key={link.label} accessibilityRole="link"
        accessibilityLabel={ui('Abrir perfil en {network}', { network: link.label })}
        accessibilityHint={ui('Abre un sitio externo')}
        onPress={() => { void WebBrowser.openBrowserAsync(link.url).catch(() => Alert.alert(ui('Redes sociales'), ui('No se pudo abrir el enlace. Inténtalo de nuevo.'))); }}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <Ionicons name={link.icon} size={20} color="#FFFFFF" accessible={false} />
      </Pressable>)}
    </View>
  </View>;
}
const styles = StyleSheet.create({
  container: { marginHorizontal: 20, marginTop: 18 },
  label: { color: '#A6A6A6', fontSize: 12, marginBottom: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  button: { width: 44, height: 44, borderRadius: 10, borderWidth: 1, borderColor: '#2B2B2B', backgroundColor: '#121212', alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.65 },
});
