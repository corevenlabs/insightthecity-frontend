import type { Experience } from '../constants/experiences';
const legacyCode = (value?: string | null) => /^\s*(?:COD|CÓDIGO|CODIGO|CODE)\s*:\s*([A-Za-z0-9_-]{3,80})\s*$/i.exec(value || '')?.[1];
export function scopedBenefitExperience(item: Experience | undefined, loadedScope: string, scope: string, premium: boolean): Experience | undefined {
  if (!item?.privateBenefitRequired || (premium && loadedScope === scope)) return item;
  return { ...item, privateBenefitCode: null, benefitUrl: null, ticketUrl: null };
}
export function publicSavedExperience(item: Experience): Experience {
  if (item.benefitAction !== 'external') return item;
  const code = item.privateBenefitCode || legacyCode(item.memberBenefit);
  if (!code && !item.privateBenefitRequired) return item;
  const result = { ...item, privateBenefitRequired: true, benefitUrl: null, ticketUrl: null };
  delete result.privateBenefitCode;
  if (code) {
    const escaped = code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    for (const key of ['memberBenefit','cardBenefit','memberBenefitDetails','description','recommendation','benefitInstructions'] as const) {
      const value = result[key];
      if (typeof value === 'string') result[key] = value.replace(new RegExp(escaped, 'gi'), 'Beneficio exclusivo para miembros ITC Club');
    }
    if (legacyCode(item.memberBenefit)) result.memberBenefit = 'Beneficio exclusivo para miembros ITC Club';
  }
  return result;
}
