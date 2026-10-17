import type { Experience } from '../constants/experiences';

/** Only editorial picks, never inferred from traffic or premium access. */
export function topTodayExperiences(experiences: Experience[], now = Date.now()): Experience[] {
  return experiences.filter(item => item.section === 'top_today' && item.isFeatured === true
    && item.isPublished !== false && Boolean(item.image?.trim())
    && (!item.endsAt || new Date(item.endsAt).getTime() > now))
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.id.localeCompare(b.id))
    .slice(0, 3);
}
