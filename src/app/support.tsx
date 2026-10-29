import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Clipboard, Linking, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ClubLogo } from '../components/ClubLogo';
import { ScreenBackButton } from '../components/ScreenBackButton';
import { Text } from '../components/typography';
import { useLanguage } from '../context/LanguageContext';

const EMAIL = 'soporte@insightthecity.com';
const GOLD = '#FDDD56';
const COPY = {
  es: {
    title: 'Ayuda y soporte', heading: 'Estamos para ayudarte', intro: 'Cuéntanos qué pasó y nuestro equipo te ayudará.',
    contact: 'Contacta con nuestro equipo', description: 'Para dudas sobre tu cuenta, membresía o beneficios.',
    write: 'Escribir a soporte', copy: 'Copiar correo', copied: 'Correo copiado', reply: 'Te responderemos por correo.',
    hint: 'Incluye el correo de tu cuenta y una breve descripción del problema.',
    subject: 'Ayuda con mi cuenta de ITC Club', body: 'Correo de mi cuenta:\n\nNecesito ayuda con:\n',
    error: 'No pudimos abrir tu aplicación de correo. Copia la dirección y escríbenos desde tu servicio de correo.',
    copyError: 'No pudimos copiar el correo. Mantén pulsada la dirección para seleccionarla y copiarla.',
  },
  en: {
    title: 'Help and support', heading: 'We’re here to help', intro: 'Tell us what happened and our team will help you.',
    contact: 'Contact our team', description: 'For questions about your account, membership or benefits.',
    write: 'Email support', copy: 'Copy email', copied: 'Email copied', reply: 'We’ll reply by email.',
    hint: 'Include your account email and a brief description of the issue.',
    subject: 'Help with my ITC Club account', body: 'My account email:\n\nI need help with:\n',
    error: 'We couldn’t open your email app. Copy the address and contact us using your email service.',
    copyError: 'We couldn’t copy the email. Press and hold the address to select and copy it.',
  },
  pt: {
    title: 'Ajuda e suporte', heading: 'Estamos aqui para ajudar', intro: 'Conte o que aconteceu e nossa equipe ajudará você.',
    contact: 'Fale com nossa equipe', description: 'Para dúvidas sobre sua conta, assinatura ou benefícios.',
    write: 'Escrever ao suporte', copy: 'Copiar e-mail', copied: 'E-mail copiado', reply: 'Responderemos por e-mail.',
    hint: 'Inclua o e-mail da sua conta e uma breve descrição do problema.',
    subject: 'Ajuda com minha conta do ITC Club', body: 'E-mail da minha conta:\n\nPreciso de ajuda com:\n',
    error: 'Não foi possível abrir seu aplicativo de e-mail. Copie o endereço e escreva pelo seu serviço de e-mail.',
    copyError: 'Não foi possível copiar o e-mail. Pressione e segure o endereço para selecionar e copiar.',
  },
};

export default function SupportScreen() {
  const { language } = useLanguage();
  const c = COPY[language];
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [opening, setOpening] = useState(false);
  async function openEmail() {
    if (opening) return;
    setOpening(true);
    setError('');
    try {
      await Linking.openURL(`mailto:${EMAIL}?subject=${encodeURIComponent(c.subject)}&body=${encodeURIComponent(c.body)}`);
    } catch { setError(c.error); }
    finally { setOpening(false); }
  }
  async function copyEmail() {
    setError('');
    setCopied(false);
    try {
      if (Platform.OS === 'web') await navigator.clipboard.writeText(EMAIL);
      else Clipboard.setString(EMAIL);
      setCopied(true);
    } catch { setError(c.copyError); }
  }
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <ScreenBackButton />
        <Text style={styles.title} accessibilityRole="header">{c.title}</Text>
        <ClubLogo width={54} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.intro}>
          <Ionicons name="mail-outline" size={38} color={GOLD} accessible={false} />
          <Text style={styles.heading} accessibilityRole="header">{c.heading}</Text>
          <Text style={styles.body}>{c.intro}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle} accessibilityRole="header">{c.contact}</Text>
          <Text style={styles.body}>{c.description}</Text>
          <Text selectable style={styles.email}>{EMAIL}</Text>
          <Pressable accessibilityRole="button" accessibilityState={{ disabled: opening }} disabled={opening} onPress={openEmail} style={({ pressed }) => [styles.button, styles.primary, (pressed || opening) && styles.pressed]}>
            <Ionicons name="mail-outline" size={22} color="#0A0A0A" accessible={false} />
            <Text style={styles.primaryText}>{c.write}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={copyEmail} style={({ pressed }) => [styles.button, styles.secondary, pressed && styles.pressed]}>
            <Ionicons name={copied ? 'checkmark-outline' : 'copy-outline'} size={21} color="#FFF" accessible={false} />
            <Text style={styles.secondaryText} accessibilityLiveRegion="polite">{copied ? c.copied : c.copy}</Text>
          </Pressable>
          <Text style={styles.note}>{c.reply}</Text>
          {!!error && <Text style={styles.error} accessibilityRole="alert">{error}</Text>}
        </View>
        <Text style={styles.hint}>{c.hint}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0A0A0A' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  title: { flex: 1, color: '#FFF', fontSize: 22, fontWeight: '800', textAlign: 'center' },
  content: { padding: 24, paddingBottom: 40, gap: 24, width: '100%', maxWidth: 600, alignSelf: 'center' },
  intro: { gap: 16, paddingTop: 16 },
  heading: { color: '#FFF', fontSize: 30, fontWeight: '800' },
  body: { color: '#E5E5E5', fontSize: 16, lineHeight: 24 },
  card: { padding: 22, borderRadius: 20, borderWidth: 1, borderColor: '#303030', backgroundColor: '#141414', gap: 16 },
  cardTitle: { color: '#FFF', fontSize: 22, fontWeight: '700' },
  email: { color: '#FFF', fontSize: 16, lineHeight: 24 },
  button: { minHeight: 52, paddingHorizontal: 14, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 14 },
  primary: { backgroundColor: GOLD },
  secondary: { borderWidth: 1, borderColor: '#777' },
  primaryText: { color: '#0A0A0A', fontSize: 17, fontWeight: '700', flexShrink: 1 },
  secondaryText: { color: '#FFF', fontSize: 17, fontWeight: '700', flexShrink: 1 },
  pressed: { opacity: 0.7 },
  note: { color: '#CCC', fontSize: 14, lineHeight: 21 },
  hint: { color: '#E5E5E5', fontSize: 15, lineHeight: 23 },
  error: { color: '#FFB4B4', fontSize: 15, lineHeight: 23 },
});
