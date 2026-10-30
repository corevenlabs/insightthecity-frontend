import type { Experience } from '../constants/experiences';

/** Explicit editorial placement, independent of membership access and Top de hoy. */
export function itcRecommendedExperiences(experiences: Experience[]): Experience[] {
  return experiences.filter(item => item.isItcRecommended === true
    && item.isPublished !== false && Boolean(item.image?.trim()))
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.id.localeCompare(b.id));
}
