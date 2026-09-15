import type { Experience } from '../constants/experiences';

export const EXPERIENCE_FILTERS = [
  'NY', 'NJ', 'Hoy', 'Este fin de semana', 'Gratis', 'Música', 'Broadway',
  'Food', 'Arte', 'Nightlife', 'Evento', 'City Drop', 'Descuento', 'Drop',
  'Que hacer en NY', 'Nueva York al día', 'Guía turística',
  'Experiencia', 'Experiencia inmersiva', 'Museo', 'Comida', 'Miradores', 'Museos', 'Noche',
] as const;

export function normalize(value?: string | null) {
  return (value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
}

export function getExperienceTags(experience: Experience): string[] {
  const tags = experience.tags?.length ? experience.tags : [experience.category].filter(Boolean);
  return tags.filter((tag, index) => tags.findIndex((other) => normalize(other) === normalize(tag)) === index);
}

export function availableExperienceTags(items: Experience[]): string[] {
  const tags: string[] = [...EXPERIENCE_FILTERS];
  items.flatMap(getExperienceTags).forEach((tag) => {
    if (!tags.some((existing) => normalize(existing) === normalize(tag))) tags.push(tag);
  });
  return tags;
}

export function matchesExperienceFilter(experience: Experience, filter: string) {
  if (filter === 'Todos') return true;
  if (getExperienceTags(experience).some((tag) => normalize(tag) === normalize(filter))) return true;
  if (filter === 'NY' || filter === 'NJ') return (experience.region ?? 'NY') === filter;
  if (filter === 'Gratis') return experience.access === 'free' && !experience.isPaidEvent;
  const date = normalize(experience.date);
  if (filter === 'Hoy') return date.includes('hoy');
  if (filter === 'Este fin de semana') {
    return ['fin de semana', 'viernes', 'sabado', 'domingo'].some((term) => date.includes(term));
  }
  return false;
}

export function matchesExperienceTags(experience: Experience, tags: string[]) {
  return tags.length === 0 || tags.some((tag) => matchesExperienceFilter(experience, tag));
}
