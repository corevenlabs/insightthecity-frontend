import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { API_URL } from '../constants/api';
import type { User } from '../context/AuthContext';

// Pagos con Stripe Checkout en el navegador del sistema (no en un WebView): la
// página de pago es la real de Stripe, con su dominio visible, y al terminar
// vuelve a la app por el deep link itcclub://checkout-return.

export const CHECKOUT_RETURN_PATH = 'checkout-return';
export const CHECKOUT_RETURN_URL = Linking.createURL(CHECKOUT_RETURN_PATH);

export type Plan = {
  amountCents: number;
  currency: string;
  interval: 'day' | 'week' | 'month' | 'year';
  intervalCount: number;
};

export type CheckoutReturn = {
  result: 'success' | 'cancel' | 'portal' | 'dismiss';
  sessionId?: string;
  guideId?: string;
};

async function json<T>(response: Response, fallback: string): Promise<T> {
  let body: any = null;
  try { body = await response.json(); } catch { /* respuesta vacía */ }
  if (!response.ok || body?.success === false) throw new Error(body?.message || fallback);
  return body as T;
}

export function parseCheckoutReturn(url: string): CheckoutReturn {
  const { queryParams } = Linking.parse(url);
  const value = (key: string) => {
    const raw = queryParams?.[key];
    return typeof raw === 'string' && raw ? raw : undefined;
  };
  const result = value('result');
  return {
    result: result === 'success' || result === 'cancel' || result === 'portal' ? result : 'dismiss',
    sessionId: value('session_id'),
    guideId: value('guide_id'),
  };
}

// Abre una URL de Stripe y espera a que el usuario vuelva a la app.
export async function openStripePage(url: string): Promise<CheckoutReturn> {
  const response = await WebBrowser.openAuthSessionAsync(url, CHECKOUT_RETURN_URL);
  if (response.type !== 'success') return { result: 'dismiss' };
  return parseCheckoutReturn(response.url);
}

export async function fetchPlan(): Promise<Plan> {
  const response = await fetch(`${API_URL}/api/payment/plan`);
  return (await json<{ plan: Plan }>(response, 'No se pudo cargar el precio del plan')).plan;
}

export async function createSubscriptionCheckout(token: string): Promise<string> {
  const response = await fetch(`${API_URL}/api/payment/create-subscription`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ autorenewConsent: true, returnUrl: CHECKOUT_RETURN_URL }),
  });
  return (await json<{ checkoutUrl: string }>(response, 'No se pudo generar el link de pago')).checkoutUrl;
}

export async function confirmSubscription(token: string, sessionId: string): Promise<User> {
  const response = await fetch(`${API_URL}/api/payment/confirm-subscription`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId }),
  });
  return (await json<{ user: User }>(response, 'No se pudo confirmar el pago')).user;
}

export async function createBillingPortal(token: string): Promise<string> {
  const response = await fetch(`${API_URL}/api/payment/portal`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ returnUrl: CHECKOUT_RETURN_URL }),
  });
  return (await json<{ url: string }>(response, 'No se pudo abrir la gestión de la membresía')).url;
}

const LOCALES = { es: 'es-US', en: 'en-US', pt: 'pt-BR' } as const;

export function formatMoney(amountCents: number, currency: string, language: keyof typeof LOCALES) {
  try {
    return new Intl.NumberFormat(LOCALES[language], { style: 'currency', currency: currency.toUpperCase() }).format(amountCents / 100);
  } catch {
    return `${currency.toUpperCase()} ${(amountCents / 100).toFixed(2)}`;
  }
}

export function formatDate(iso: string, language: keyof typeof LOCALES) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(LOCALES[language], { day: 'numeric', month: 'long', year: 'numeric' });
}
