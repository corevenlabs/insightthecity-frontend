import { API_URL } from '../constants/api';
import type { Experience } from '../constants/experiences';

export async function fetchExperiences(section?: string): Promise<Experience[]> {
  const params = new URLSearchParams();
  if (section) params.set('section', section);
  params.set('_fresh', String(Date.now()));
  const response = await fetch(`${API_URL}/api/experiences?${params.toString()}`, {
    headers: { 'Cache-Control': 'no-cache' },
  });
  if (!response.ok) throw new Error('No se pudo actualizar el contenido.');
  return response.json() as Promise<Experience[]>;
}

export async function fetchExperience(id: string): Promise<Experience> {
  const response = await fetch(`${API_URL}/api/experiences/${encodeURIComponent(id)}?_fresh=${Date.now()}`, {
    headers: { 'Cache-Control': 'no-cache' },
  });
  if (!response.ok) throw new Error('Contenido no disponible.');
  return response.json() as Promise<Experience>;
}
