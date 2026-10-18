import { Text } from '../components/typography';
import { ClubLogo } from '../components/ClubLogo';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MembershipPrice } from '../components/MembershipPrice';
import { useLanguage } from '../context/LanguageContext';
import { fetchPlan, type Plan } from '../lib/payments';

export default function ChooseAccessScreen() {
  const { ui } = useLanguage();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    void fetchPlan().then(value => { if (active) setPlan(value); }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [attempt]);
  return <SafeAreaView style={styles.container}>
    <ScrollView contentContainerStyle={styles.content}>
      <ClubLogo width={132} header />
      <Text style={styles.title}>{ui('Bienvenido a ITC')}</Text>
      <Text style={styles.body}>{ui('Elige cómo explorar la ciudad. Puedes continuar gratis o conocer los beneficios de la membresía.')}</Text>
      <View style={styles.card}>
        <Ionicons name="compass-outline" size={30} color="#FDDD56" />
        <Text style={styles.heading}>{ui('ACCESO GRATIS')}</Text>
        <Text style={styles.body}>{ui('Explora lugares, eventos y contenido gratuito. También puedes consultar los beneficios del Club; obtener y canjear sus cupones requiere membresía.')}</Text>
        <Text style={styles.note}>{ui('Sin suscripción ni cobros por continuar gratis.')}</Text>
        <Pressable accessibilityRole="button" style={styles.secondary} onPress={() => router.replace('/home')}><Text style={styles.secondaryText}>{ui('Continuar gratis')}</Text></Pressable>
      </View>
      <View style={[styles.card, styles.club]}>
        <Ionicons name="ticket-outline" size={30} color="#FDDD56" />
        <ClubLogo width={96} header />
        <Text style={styles.body}>{ui('Obtén cupones, descuentos y beneficios exclusivos para canjear en restaurantes y eventos participantes.')}</Text>
        <MembershipPrice plan={plan} error={error} retry={() => { setError(false); setAttempt(value => value + 1); }} />
        <Pressable accessibilityRole="button" style={styles.primary} onPress={() => router.replace('/club')}><Text style={styles.primaryText}>{ui('Ver membresía y beneficios')}</Text></Pressable>
        <Text style={styles.note}>{ui('Ver la membresía no genera ningún cobro. Cada beneficio tiene sus propias condiciones.')}</Text>
      </View>
    </ScrollView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' }, content: { padding: 22, paddingBottom: 36, width: '100%', maxWidth: 680, alignSelf: 'center', gap: 16 },
  logo: { color: '#FFF', fontSize: 32, fontWeight: '900', marginVertical: 10 }, gold: { color: '#FDDD56' }, title: { color: '#FFF', fontSize: 30, fontWeight: '800' },
  body: { color: '#BBB', fontSize: 15, lineHeight: 23 }, card: { backgroundColor: '#111', borderRadius: 18, borderWidth: 1, borderColor: '#292929', padding: 20, gap: 12 },
  club: { borderColor: '#FDDD56' }, heading: { color: '#FFF', fontSize: 20, fontWeight: '800' }, note: { color: '#AAA', fontSize: 13, lineHeight: 20 },
  primary: { backgroundColor: '#FDDD56', minHeight: 54, padding: 15, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, primaryText: { color: '#0A0A0A', fontSize: 15, fontWeight: '800', textAlign: 'center' },
  secondary: { borderColor: '#FDDD56', borderWidth: 1, minHeight: 54, padding: 15, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, secondaryText: { color: '#FDDD56', fontSize: 15, fontWeight: '800' },
});
