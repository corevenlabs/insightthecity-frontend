import { API_URL } from '../constants/api';

// Aviso y permiso para el chat con IA (App Store 5.1.2(i)). El texto lo envía el
// backend para que lo que se muestra sea exactamente lo que queda como evidencia.
export type AiConsentNotice = {
  title: string;
  intro: string;
  points: string[];
  retention: string;
  advice: string;
  control: string;
};

export type AiConsent = {
  version: number;
  accepted: boolean;
  acceptedAt: string | null;
  language: string;
  notice: AiConsentNotice;
};

async function request(method: 'POST' | 'DELETE', token: string, body?: object): Promise<AiConsent> {
  const response = await fetch(`${API_URL}/api/chat/consent`, {
    method,
    headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data: any = null;
  try { data = await response.json(); } catch { /* respuesta vacía */ }
  if (!response.ok || !data?.aiConsent) throw new Error(data?.message || 'No se pudo guardar el permiso');
  return data.aiConsent as AiConsent;
}

export const grantAiConsent = (token: string, version: number) => request('POST', token, { version });
export const revokeAiConsent = (token: string) => request('DELETE', token);
