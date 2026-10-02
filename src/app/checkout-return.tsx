import { Redirect, useLocalSearchParams } from 'expo-router';

// Destino del deep link de Stripe cuando la app se abrió desde cero (el flujo
// normal lo resuelve openAuthSessionAsync en la pantalla que inició el pago).
export default function CheckoutReturnScreen() {
  const params = useLocalSearchParams<{ result?: string; session_id?: string; guide_id?: string }>();
  const first = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value);
  const result = first(params.result);
  const sessionId = first(params.session_id);
  const guideId = first(params.guide_id);

  if (result === 'success' && sessionId && guideId) {
    return <Redirect href={{ pathname: '/guides', params: { purchaseSession: sessionId, guideId } }} />;
  }
  if (result === 'success' && sessionId) {
    return <Redirect href={{ pathname: '/success', params: { session_id: sessionId } }} />;
  }
  if (result === 'portal') return <Redirect href="/profile" />;
  return <Redirect href="/home" />;
}
