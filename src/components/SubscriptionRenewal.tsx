import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import type { User } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { changeSubscriptionRenewal, formatDate, formatMoney } from '../lib/payments';

const COPY = {
  es: { cancel: 'Cancelar renovación', reactivate: 'Reactivar renovación', cancelTitle: '¿Cancelar la renovación?', resumeTitle: '¿Reactivar la renovación?', keep: 'Mantener membresía', back: 'Volver', confirm: 'Confirmar cancelación', resume: 'Confirmar reactivación', access: 'Conservarás tus beneficios hasta el {date}. Después, tu cuenta seguirá disponible sin la membresía. No se cobrará la próxima renovación.', renewal: 'Tu membresía volverá a renovarse automáticamente el {date}, al precio de tu plan actual: {price}.', canceled: 'Renovación cancelada', resumed: 'Renovación reactivada', email: 'Te enviamos un correo de confirmación.', noEmail: 'El cambio está confirmado. No pudimos enviar el correo de confirmación.', error: 'No pudimos confirmar el cambio. Revisa el estado de tu membresía y vuelve a intentarlo.', scheduled: 'La renovación está cancelada. Conservas tus beneficios hasta el {date}.', active: 'Tu membresía se renueva automáticamente. Puedes cancelar la renovación y conservar el período pagado.' },
  en: { cancel: 'Cancel renewal', reactivate: 'Reactivate renewal', cancelTitle: 'Cancel your renewal?', resumeTitle: 'Reactivate your renewal?', keep: 'Keep membership', back: 'Back', confirm: 'Confirm cancellation', resume: 'Confirm reactivation', access: 'Your benefits remain available until {date}. Your account remains available without membership afterward. The next renewal will not be charged.', renewal: 'Your membership will automatically renew on {date} at your current plan price: {price}.', canceled: 'Renewal canceled', resumed: 'Renewal reactivated', email: 'We sent you a confirmation email.', noEmail: 'The change is confirmed. We could not send the confirmation email.', error: 'We could not confirm the change. Check your membership status and try again.', scheduled: 'Renewal is canceled. Your benefits remain available until {date}.', active: 'Your membership renews automatically. You can cancel renewal and keep your paid period.' },
  pt: { cancel: 'Cancelar renovação', reactivate: 'Reativar renovação', cancelTitle: 'Cancelar a renovação?', resumeTitle: 'Reativar a renovação?', keep: 'Manter assinatura', back: 'Voltar', confirm: 'Confirmar cancelamento', resume: 'Confirmar reativação', access: 'Seus benefícios continuam até {date}. Depois, sua conta continua disponível sem assinatura. A próxima renovação não será cobrada.', renewal: 'Sua assinatura voltará a renovar automaticamente em {date}, pelo preço do plano atual: {price}.', canceled: 'Renovação cancelada', resumed: 'Renovação reativada', email: 'Enviamos um e-mail de confirmação.', noEmail: 'A alteração foi confirmada. Não foi possível enviar o e-mail de confirmação.', error: 'Não foi possível confirmar a alteração. Confira sua assinatura e tente novamente.', scheduled: 'A renovação está cancelada. Seus benefícios continuam até {date}.', active: 'Sua assinatura renova automaticamente. Você pode cancelar a renovação e manter o período pago.' },
};

export function SubscriptionRenewal({ user, token, disabled, onBusy, onUpdate }: {
  user: User; token: string; disabled: boolean; onBusy: (busy: boolean) => void; onUpdate: (user: User) => Promise<void>;
}) {
  const { language } = useLanguage();
  const c = COPY[language];
  const [action, setAction] = useState<'cancel' | 'resume' | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [result, setResult] = useState<{ cancel: boolean; email: boolean; changed: boolean } | null>(null);
  const [openedAt] = useState(() => Date.now());
  const pending = useRef(false);
  const date = user.subscription_current_period_end ? formatDate(user.subscription_current_period_end, language) : '—';
  const price = user.subscription_amount_cents != null ? formatMoney(user.subscription_amount_cents, user.subscription_currency || 'usd', language) : '—';
  const fill = (text: string) => text.replace('{date}', date).replace('{price}', price);
  const eligible = ['active', 'trialing', 'past_due'].includes(user.subscription_status || '') && !!user.subscription_current_period_end && new Date(user.subscription_current_period_end).getTime() > openedAt;
  async function confirm() {
    if (pending.current || disabled || !action) return;
    pending.current = true; setBusy(true); onBusy(true); setError(false); setResult(null);
    try {
      const response = await changeSubscriptionRenewal(token, action === 'cancel');
      await onUpdate(response.user);
      setResult({ cancel: response.user.subscription_cancel_at_period_end === true, email: response.emailSent, changed: response.changed });
      setAction(null);
    } catch { setError(true); }
    finally { pending.current = false; setBusy(false); onBusy(false); }
  }
  return <View style={s.container}>
    {eligible && <Text style={s.note}>{fill(user.subscription_cancel_at_period_end ? c.scheduled : c.active)}</Text>}
    {result && <View style={s.success} accessibilityLiveRegion="polite"><Ionicons name="checkmark-circle-outline" color="#FDDD56" size={25} /><Text style={s.successText}>{result.cancel ? c.canceled : c.resumed}{result.changed ? `\n${result.email ? c.email : c.noEmail}` : ''}</Text></View>}
    {error && <Text style={s.error} accessibilityRole="alert">{c.error}</Text>}
    {eligible && (action ? <View style={s.confirmation}>
      <Ionicons name={action === 'cancel' ? 'calendar-outline' : 'refresh-outline'} size={28} color="#FDDD56" accessible={false} />
      <Text style={s.heading} accessibilityRole="header">{action === 'cancel' ? c.cancelTitle : c.resumeTitle}</Text>
      <Text style={s.note}>{fill(action === 'cancel' ? c.access : c.renewal)}</Text>
      <Pressable disabled={busy || disabled} onPress={() => void confirm()} accessibilityRole="button" accessibilityState={{ busy, disabled: busy || disabled }} style={({ pressed }) => [s.primary, pressed && s.pressed, (busy || disabled) && s.disabled]}>
        {busy ? <ActivityIndicator color="#0A0A0A" /> : <Text style={s.primaryText}>{action === 'cancel' ? c.confirm : c.resume}</Text>}
      </Pressable>
      <Pressable disabled={busy || disabled} onPress={() => { setAction(null); setError(false); }} accessibilityRole="button" style={({ pressed }) => [s.secondary, pressed && s.pressed]}><Text style={s.secondaryText}>{action === 'cancel' ? c.keep : c.back}</Text></Pressable>
    </View> : <Pressable disabled={disabled || busy} accessibilityRole="button" style={({ pressed }) => [s.secondary, pressed && s.pressed, disabled && s.disabled]} onPress={() => { setAction(user.subscription_cancel_at_period_end ? 'resume' : 'cancel'); setResult(null); setError(false); }}><Ionicons name={user.subscription_cancel_at_period_end ? 'refresh-outline' : 'close-circle-outline'} size={20} color="#FDDD56" accessible={false} /><Text style={s.secondaryText}>{user.subscription_cancel_at_period_end ? c.reactivate : c.cancel}</Text></Pressable>)}
  </View>;
}
const s = StyleSheet.create({
  container: { gap: 16, marginVertical: 20 }, note: { color: '#C4C4C4', fontSize: 15, lineHeight: 23 },
  confirmation: { padding: 20, gap: 16, borderRadius: 18, borderWidth: 1, borderColor: '#6F5C22', backgroundColor: '#161616' }, heading: { color: '#FFF', fontSize: 21, fontWeight: '600' },
  primary: { minHeight: 52, padding: 14, borderRadius: 14, backgroundColor: '#FDDD56', justifyContent: 'center', alignItems: 'center' }, primaryText: { color: '#0A0A0A', fontSize: 16, fontWeight: '700', textAlign: 'center' },
  secondary: { minHeight: 52, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#6F5C22' }, secondaryText: { flexShrink: 1, color: '#FDDD56', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  success: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', padding: 16, borderRadius: 14, backgroundColor: '#1B1B14' }, successText: { flex: 1, color: '#EAEAEA', fontSize: 15, lineHeight: 23 }, error: { color: '#FF8080', fontSize: 15, lineHeight: 23 }, pressed: { opacity: 0.75 }, disabled: { opacity: 0.5 },
});
