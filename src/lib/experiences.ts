import type { AppLanguage } from '../context/LanguageContext';
import { API_URL } from '../constants/api';
import type { Experience } from '../constants/experiences';

export async function fetchExperiences(section?: string, language: AppLanguage = 'es'): Promise<Experience[]> {
  const params = new URLSearchParams();
  if (section) params.set('section', section);
  params.set('lang', language);
  params.set('_fresh', String(Date.now()));
  const response = await fetch(`${API_URL}/api/experiences?${params.toString()}`, {
    headers: { 'Cache-Control': 'no-cache' },
  });
  if (!response.ok) throw new Error('No se pudo actualizar el contenido.');
  return response.json() as Promise<Experience[]>;
}

export async function fetchExperience(id: string, language: AppLanguage = 'es'): Promise<Experience> {
  const response = await fetch(`${API_URL}/api/experiences/${encodeURIComponent(id)}?lang=${language}&_fresh=${Date.now()}`, {
    headers: { 'Cache-Control': 'no-cache' },
  });
  if (!response.ok) throw new Error('Contenido no disponible.');
  const item = await response.json() as Experience;
  const responseDate = response.headers?.get?.('Date');
  const serverTime = responseDate && Number.isFinite(Date.parse(responseDate)) ? new Date(responseDate).toISOString() : item.couponServerTime;
  return { ...item, couponServerTime: serverTime, couponReceivedAt: Date.now() };
}
