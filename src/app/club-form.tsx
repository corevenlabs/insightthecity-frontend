import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { createSubscriptionCheckout, fetchPlan, formatMoney, openStripePage, type Plan } from '../lib/payments';

const GOLD = '#D4AF37';
const BLACK = '#0A0A0A';

const INTERVALS: Record<Plan['interval'], string> = { day: 'día', week: 'semana', month: 'mes', year: 'año' };

// Alta en ITC Club. La ley de renovación automática de New York (GBL §527-a) exige
// mostrar precio, período y renovación de forma clara antes de pagar y obtener un
// consentimiento afirmativo específico: por eso la casilla separada.
export default function ClubFormScreen() {
  const { ui, language } = useLanguage();
  const { user, token } = useAuth();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [planError, setPlanError] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchPlan()
      .then(setPlan)
      .catch(() => setPlanError(ui('No se pudo cargar el precio. Revisa tu conexión e inténtalo de nuevo.')));
  }, [ui]);

  const price = plan ? formatMoney(plan.amountCents, plan.currency, language) : '';
  const period = plan ? ui(INTERVALS[plan.interval] ?? plan.interval) : '';
  const canSubscribe = Boolean(plan && consent && token && !loading);

  const subscribe = async () => {
    if (!token || !plan || !consent || loading) return;
    setLoading(true);
    setMessage('');
    try {
      const checkoutUrl = await createSubscriptionCheckout(token);
      const result = await openStripePage(checkoutUrl);
      if (result.result === 'success' && result.sessionId) {
        router.replace({ pathname: '/success', params: { session_id: result.sessionId } });
        return;
      }
      setMessage(ui('No se completó el pago. No se te cobró nada.'));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : ui('No se pudo iniciar el pago. Intenta de nuevo.'));
    } finally {
      setLoading(false);
    }
  };

  const header = (
    <View style={styles.header}>
      <Pressable
        onPress={() => router.back()}
        style={styles.backButton}
        accessibilityRole="button"
        accessibilityLabel={ui('Volver')}
        hitSlop={8}
      >
        <Ionicons name="arrow-back" size={24} color={GOLD} />
      </Pressable>
      <Text style={styles.headerTitle} accessibilityRole="header">ITC CLUB</Text>
      <View style={styles.backButton} />
    </View>
  );

  if (!user || !token) {
    return (
      <SafeAreaView style={styles.container}>
        {header}
        <View style={styles.centered}>
          <Text style={styles.title}>{ui('Necesitas una cuenta')}</Text>
          <Text style={styles.body}>{ui('Crea una cuenta o inicia sesión para unirte a ITC Club. La membresía queda asociada a tu cuenta.')}</Text>
          <Pressable style={styles.primaryButton} accessibilityRole="button" onPress={() => router.push('/login')}>
            <Text style={styles.primaryText}>{ui('INICIAR SESIÓN')}</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} accessibilityRole="button" onPress={() => router.push('/register')}>
            <Text style={styles.secondaryText}>{ui('CREAR CUENTA')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (user.is_premium) {
    return (
      <SafeAreaView style={styles.container}>
        {header}
        <View style={styles.centered}>
          <Ionicons name="checkmark-circle" size={56} color={GOLD} />
          <Text style={styles.title}>{ui('Ya eres miembro de ITC Club')}</Text>
          <Text style={styles.body}>{ui('Puedes ver o cancelar tu membresía en Perfil > Mi membresía.')}</Text>
          <Pressable style={styles.primaryButton} accessibilityRole="button" onPress={() => router.replace('/profile')}>
            <Text style={styles.primaryText}>{ui('IR A MI PERFIL')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {header}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{ui('PLAN')}</Text>
          <Text style={styles.planName}>ITC Club</Text>
          {plan ? (
            <Text style={styles.planPrice}>{`${price} / ${period}`}</Text>
          ) : planError ? (
            <Text style={styles.errorText} accessibilityRole="alert">{planError}</Text>
          ) : (
            <ActivityIndicator color={GOLD} style={{ alignSelf: 'flex-start', marginTop: 10 }} accessibilityLabel={ui('Cargando…')} />
          )}
          <Text style={styles.body}>{ui('Acceso a beneficios exclusivos, descuentos y experiencias especiales.')}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{ui('TU CUENTA')}</Text>
          <Text style={styles.body}>{ui('La membresía se asociará a tu cuenta:')}</Text>
          <Text style={styles.accountEmail}>{user.email}</Text>
          <Text style={styles.note}>{ui('Pagarás en la página segura de Stripe con tarjeta, Apple Pay o Google Pay. No guardamos los datos de tu tarjeta.')}</Text>
        </View>

        {plan && (
          <View style={styles.renewalBox}>
            <View style={styles.renewalHeading}>
              <Ionicons name="refresh-circle-outline" size={22} color={GOLD} />
              <Text style={styles.renewalTitle}>{ui('Renovación automática')}</Text>
            </View>
            <Text style={styles.renewalText}>
              {ui('Se te cobrarán {price} hoy y luego cada {period}, de forma automática, hasta que canceles.', { price, period })}
            </Text>
            <Text style={styles.renewalText}>
              {ui('Puedes cancelar cuando quieras en Perfil > Mi membresía. La cancelación aplica al final del período pagado y conservas el acceso hasta entonces.')}
            </Text>
            <Pressable
              accessibilityRole="link"
              hitSlop={8}
              onPress={() => router.push({ pathname: '/legal', params: { slug: 'subscription' } })}
            >
              <Text style={styles.link}>{ui('Leer los Términos de la membresía')}</Text>
            </Pressable>
          </View>
        )}

        {plan && (
          <Pressable
            style={styles.consentRow}
            onPress={() => setConsent((value) => !value)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: consent }}
          >
            <View style={[styles.checkbox, consent && styles.checkboxActive]}>
              {consent && <Ionicons name="checkmark" size={16} color={BLACK} />}
            </View>
            <Text style={styles.consentText}>
              {ui('Acepto que mi membresía se renueve automáticamente por {price} cada {period} hasta que la cancele, y acepto los Términos de la membresía.', { price, period })}
            </Text>
          </Pressable>
        )}

        {!!message && (
          <Text style={styles.errorText} accessibilityRole="alert" accessibilityLiveRegion="polite">{message}</Text>
        )}

        <Pressable
          style={[styles.primaryButton, !canSubscribe && styles.buttonDisabled]}
          onPress={subscribe}
          disabled={!canSubscribe}
          accessibilityRole="button"
          accessibilityState={{ disabled: !canSubscribe, busy: loading }}
        >
          {loading ? (
            <ActivityIndicator color={BLACK} />
          ) : (
            <Text style={styles.primaryText}>
              {plan ? ui('SUSCRIBIRME POR {price} / {period}', { price, period: period.toUpperCase() }) : ui('CONTINUAR AL PAGO')}
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BLACK },
  content: { width: '100%', maxWidth: 640, alignSelf: 'center', paddingHorizontal: 20, paddingBottom: 48 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, marginBottom: 12 },
  backButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: GOLD, fontSize: 20, fontWeight: '800' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, gap: 14 },
  title: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', textAlign: 'center' },
  card: { backgroundColor: '#111111', borderRadius: 16, padding: 18, marginBottom: 16 },
  sectionTitle: { color: GOLD, fontSize: 13, fontWeight: '800', letterSpacing: 1, marginBottom: 10 },
  planName: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  planPrice: { color: GOLD, fontSize: 26, fontWeight: '800', marginTop: 6 },
  body: { color: '#C9C9C9', fontSize: 15, lineHeight: 22, marginTop: 8, textAlign: 'left' },
  accountEmail: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginTop: 4 },
  note: { color: '#A6A6A6', fontSize: 13, lineHeight: 19, marginTop: 12 },
  renewalBox: { borderWidth: 1, borderColor: GOLD, borderRadius: 16, padding: 18, marginBottom: 16, backgroundColor: '#15120A', gap: 8 },
  renewalHeading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  renewalTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  renewalText: { color: '#EDEDED', fontSize: 15, lineHeight: 22 },
  link: { color: GOLD, fontSize: 14, fontWeight: '700', textDecorationLine: 'underline', marginTop: 4 },
  consentRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 8, marginBottom: 12 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: GOLD, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  checkboxActive: { backgroundColor: GOLD },
  consentText: { flex: 1, color: '#EAEAEA', fontSize: 14, lineHeight: 20 },
  errorText: { color: '#FF8A8A', fontSize: 14, lineHeight: 20, marginBottom: 12 },
  primaryButton: { minHeight: 56, backgroundColor: GOLD, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, alignSelf: 'stretch' },
  buttonDisabled: { opacity: 0.45 },
  primaryText: { color: '#000', fontWeight: '800', fontSize: 15, textAlign: 'center' },
  secondaryButton: { minHeight: 52, borderRadius: 14, borderWidth: 1, borderColor: GOLD, alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch' },
  secondaryText: { color: GOLD, fontWeight: '800', fontSize: 15 },
});
