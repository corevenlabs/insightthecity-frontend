import { useEffect, useState } from 'react';
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

// Reservation ownership is account/experience scoped, never tied to display language.
export async function fetchBenefitReservation(experienceId: string, token: string): Promise<boolean> {
  const response = await fetch(`${API_URL}/api/benefits/${encodeURIComponent(experienceId)}/reservation`, {
    headers: { Authorization: `Bearer ${token}`, 'Cache-Control': 'no-cache' },
  });
  if (!response.ok) return false;
  const body = await response.json();
  return body.reserved === true;
}
export function useBenefitReservation(experienceId: string | undefined, token: string | null, revision?: string) {
  const [reservation, setReservation] = useState<{ id: string; token: string; reserved: boolean } | null>(null);
  useEffect(() => {
    let active = true;
    if (experienceId && token) {
      void fetchBenefitReservation(experienceId, token).then(reserved => {
        if (active) setReservation({ id: experienceId, token, reserved });
      }).catch(() => {});
    }
    return () => { active = false; };
  }, [experienceId, token, revision]);
  return reservation?.id === experienceId && reservation?.token === token && reservation.reserved;
}
export function qrUnavailable(status: string | null | undefined, hasReservation: boolean): boolean {
  return status === 'paused' || (status === 'sold_out' && !hasReservation);
}
