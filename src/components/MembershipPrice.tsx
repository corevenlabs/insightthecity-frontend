import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { formatMoney, type Plan } from '../lib/payments';

export function MembershipPrice({ plan, error, retry, compact = false, dense = false }: { compact?: boolean; dense?: boolean; plan: Plan | null; error?: boolean; retry?: () => void }) {
  const { ui, language } = useLanguage();
  const interval = plan ? ui(({ day: 'día', week: 'semana', month: 'mes', year: 'año' })[plan.interval]) : '';
  const period = plan ? (plan.intervalCount === 1 ? interval : `${plan.intervalCount} ${interval}`) : '';
  return <View style={[styles.box, compact && styles.compact, dense && styles.dense]}>
    {!dense && <Text style={[styles.label, compact && styles.centered]}>{ui('Membresía de pago')}</Text>}
    {plan ? <>
      <Text style={[styles.price, compact && styles.centered, dense && styles.densePrice]}>{dense && plan.currency.toLowerCase() === 'usd' ? `US$${(plan.amountCents / 100).toFixed(2)}` : formatMoney(plan.amountCents, plan.currency, language)} <Text style={styles.period}>/ {period}</Text></Text>
      <Text style={[styles.notice, dense && styles.denseNotice]}>{ui(dense ? 'Cobro al suscribirte. Renovación automática cada {period}.' : 'Se cobra al suscribirte y se renueva automáticamente cada {period} hasta que canceles.', { period })}</Text>
    </> : error ? <>
      <Text style={styles.notice}>{ui('No se pudo cargar el precio. Revisa tu conexión e inténtalo de nuevo.')}</Text>
      {retry && <Pressable accessibilityRole="button" onPress={retry} style={styles.retry}><Text style={styles.link}>{ui('Reintentar')}</Text></Pressable>}
    </> : <ActivityIndicator color="#FDDD56" accessibilityLabel={ui('Cargando…')} />}
    <Text style={[styles.notice, dense && styles.denseNotice]}>{ui(dense ? 'Cancela en Perfil → Mi membresía. Conservas tus beneficios hasta finalizar el período pagado.' : 'Cancela en Perfil > Mi membresía. Conservas tus beneficios hasta finalizar el período pagado.')}</Text>
  </View>;
}
const styles = StyleSheet.create({
  dense: { gap: 5, paddingVertical: 0, paddingBottom: 5 }, denseNotice: { fontSize: 13, lineHeight: 18 }, densePrice: { fontSize: 29 },
  compact: { paddingTop: 2, paddingBottom: 12 }, centered: { textAlign: 'center' },
  box: { gap: 9, paddingVertical: 18 }, label: { color: '#FDDD56', fontSize: 13, fontWeight: '700' },
  price: { color: '#FFF', fontSize: 32, fontWeight: '800' }, period: { color: '#AAA', fontSize: 18, fontWeight: '500' },
  notice: { color: '#BBB', fontSize: 14, lineHeight: 21 }, retry: { minHeight: 44, justifyContent: 'center' }, link: { color: '#FDDD56', fontWeight: '700' },
});
