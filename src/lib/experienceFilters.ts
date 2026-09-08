import type { Experience } from '../constants/experiences';

export const EXPERIENCE_FILTERS = [
  'Todos',
  'NY',
  'NJ',
  'Hoy',
  'Este fin de semana',
  'Gratis',
  'Música',
  'Broadway',
  'Food',
  'Arte',
  'Nightlife',
] as const;

export type ExperienceFilter = (typeof EXPERIENCE_FILTERS)[number];

function normalize(value?: string | null) {
  return (value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export function matchesExperienceFilter(experience: Experience, filter: ExperienceFilter) {
  if (filter === 'Todos') return true;
  if (filter === 'NY' || filter === 'NJ') return (experience.region ?? 'NY') === filter;
  if (filter === 'Gratis') return experience.access === 'free';

  const date = normalize(experience.date);
  if (filter === 'Hoy') return date.includes('hoy');
  if (filter === 'Este fin de semana') {
    return ['fin de semana', 'viernes', 'sabado', 'domingo'].some((term) => date.includes(term));
  }

  return normalize(experience.category) === normalize(filter);
}
