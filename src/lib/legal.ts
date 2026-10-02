import { API_URL } from '../constants/api';

// Documentos legales que el equipo publica desde el panel (backend: /api/legal).
export type LegalSlug = 'terms' | 'privacy' | 'subscription' | 'accessibility';

export type LegalDocument = {
  slug: LegalSlug;
  language: 'es' | 'en' | 'pt';
  version: number;
  title: string;
  content: string;
  publishedAt: string;
};

export const LEGAL_SLUGS: LegalSlug[] = ['terms', 'privacy', 'subscription', 'accessibility'];

export async function fetchLegalDocument(slug: LegalSlug, language: string): Promise<LegalDocument> {
  const response = await fetch(`${API_URL}/api/legal/${slug}?lang=${encodeURIComponent(language)}`);
  let body: any = null;
  try { body = await response.json(); } catch { /* respuesta vacía */ }
  if (!response.ok || !body?.document) throw new Error(body?.message || 'No se pudo cargar el documento');
  return body.document as LegalDocument;
}

// URL pública (la misma que se declara en App Store / Google Play).
export function legalPageUrl(slug: LegalSlug, language: string) {
  return `${API_URL}/legal/${slug}?lang=${encodeURIComponent(language)}`;
}
