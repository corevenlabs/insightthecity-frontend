import { API_URL } from '../constants/api';
import { CHECKOUT_RETURN_URL } from './payments';

export type Guide = {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  language: 'es' | 'en' | 'pt';
  region: 'NY' | 'NJ';
  access: 'free' | 'premium';
  coverUrl: string | null;
  pdfName: string | null;
  pdfSize: number;
  pageCount: number | null;
  isFeatured: boolean;
  downloads: number;
  priceCents: number;
  currency: string;
  individualPurchaseEnabled: boolean;
  includedInMembership: boolean;
  isPurchased?: boolean;
};

async function json<T>(response: Response, fallback: string): Promise<T> {
  let body: any = null;
  try { body = await response.json(); } catch { /* respuesta vacía */ }
  if (!response.ok) throw new Error(body?.message || fallback);
  return body as T;
}

export async function fetchGuides(token?: string | null) {
  const path = token ? '/api/guides/mine' : '/api/guides';
  const response = await fetch(`${API_URL}${path}?fresh=${Date.now()}`, {
    headers: {
      'Cache-Control': 'no-cache',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return json<Guide[]>(response, 'No se pudieron cargar las guías');
}

export async function getGuideDownload(id: number, token: string) {
  const response = await fetch(`${API_URL}/api/guides/${id}/download`, {
    method: 'POST', headers: { Authorization: `Bearer ${token}` },
  });
  const body = await json<{ url: string }>(response, 'No se pudo abrir la guía');
  return body.url;
}

export async function createGuidePurchase(id: number, token: string) {
  const response = await fetch(`${API_URL}/api/guides/${id}/purchase-session`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ returnUrl: CHECKOUT_RETURN_URL }),
  });
  return json<{ checkoutUrl?: string; sessionId?: string; alreadyOwned?: boolean }>(response, 'No se pudo iniciar la compra');
}

export async function confirmGuidePurchase(id: number, sessionId: string, token: string) {
  const response = await fetch(`${API_URL}/api/guides/${id}/confirm-purchase`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId }),
  });
  return json<{ success: boolean; guide: Guide }>(response, 'No se pudo confirmar la compra');
}
