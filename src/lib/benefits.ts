import { API_URL } from '../constants/api';

export type BenefitCode = {
  qrDataUrl: string;
  expiresAt: string;
  validForHours: number;
  reference: string;
  title: string;
  benefit: string | null;
  instructions: string | null;
};

export async function issueBenefitCode(experienceId: string, token: string): Promise<BenefitCode> {
  const response = await fetch(`${API_URL}/api/benefits/${encodeURIComponent(experienceId)}/code`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || 'No se pudo generar el código. Inténtalo otra vez.');
  return body as BenefitCode;
}
