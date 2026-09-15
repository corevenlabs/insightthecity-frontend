import type { Experience } from '../constants/experiences';

export function getCardBenefit(experience: Pick<Experience, 'access' | 'showBenefitOnCard' | 'cardBenefit'>): string | null {
  if (experience.access !== 'premium' || experience.showBenefitOnCard !== true) return null;
  const benefit = experience.cardBenefit?.trim();
  return benefit && benefit.length <= 60 && !/[\r\n]/.test(benefit) ? benefit : null;
}
