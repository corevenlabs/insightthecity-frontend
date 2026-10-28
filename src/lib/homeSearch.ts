import type { Experience } from '../constants/experiences';
import type { NewsCard } from './news';
import { getExperienceTags, matchesExperienceTags, normalize } from './experienceFilters';

export type SearchItem = { key: string; id: string; kind: 'experience' | 'que-hacer' | 'ny-al-dia'; title: string; description: string; image: string | null; terms: string; canonicalText?: string; experience?: Experience };

export function searchCatalog(experiences: Experience[], plans: NewsCard[], news: NewsCard[]): SearchItem[] {
  return [
    ...experiences.map(item => ({ key: `experience:${item.id}`, id: item.id, kind: 'experience' as const, title: item.title, description: item.location, image: item.image, terms: [item.title, item.description, item.location, item.region, item.category, ...getExperienceTags(item)].join(' '), experience: item })),
    ...plans.map(item => ({ key: `que-hacer:${item.id}`, id: String(item.id), kind: 'que-hacer' as const, title: item.title, description: item.excerpt, image: item.image, canonicalText: `${item.originalTitle ?? item.title} ${item.originalExcerpt ?? item.excerpt}`, terms: `${item.title} ${item.excerpt} ${item.originalTitle ?? ""} ${item.originalExcerpt ?? ""}` })),
    ...news.map(item => ({ key: `ny-al-dia:${item.id}`, id: String(item.id), kind: 'ny-al-dia' as const, title: item.title, description: item.excerpt, image: item.image, canonicalText: `${item.originalTitle ?? item.title} ${item.originalExcerpt ?? item.excerpt}`, terms: `${item.title} ${item.excerpt} ${item.originalTitle ?? ""} ${item.originalExcerpt ?? ""}` })),
  ];
}

export function matchesPlanTags(item: Pick<NewsCard, 'title' | 'excerpt' | 'originalTitle' | 'originalExcerpt'>, tags: string[]) {
  const text = normalize(`${item.originalTitle ?? item.title} ${item.originalExcerpt ?? item.excerpt}`);
  return tags.length === 0 || tags.some(tag => {
    if (tag === 'NY' || tag === 'Que hacer en NY') return true;
    const aliases: Record<string, string[]> = { food: ['food', 'comida', 'restaurante', 'gastronomia'], museo: ['museo', 'museum'], museos: ['museo', 'museum'], nightlife: ['nightlife', 'noche'], gratis: ['gratis', 'gratuito', 'free'] };
    return (aliases[normalize(tag)] ?? [normalize(tag)]).some(term => text.includes(term));
  });
}

export function findHomeResults(items: SearchItem[], query: string, tags: string[]) {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  return items.filter(item => words.every(word => normalize(item.terms).includes(word)) &&
    (item.experience ? matchesExperienceTags(item.experience, tags) : item.kind === 'que-hacer' ? matchesPlanTags({ title: item.canonicalText ?? item.title, excerpt: item.description }, tags) : true))
    .sort((a, b) => Number(normalize(b.title).startsWith(normalize(query))) - Number(normalize(a.title).startsWith(normalize(query))));
}
