export const PARTNER_DISCLOSURES = {
  founding: 'Colaboración comercial pagada: este negocio paga por participar en ITC Club. Algunas compras o reservas también pueden generarnos comisiones.',
  strategic: 'Colaboración comercial: este socio ofrece beneficios exclusivos a miembros de ITC Club. Algunas compras o reservas pueden generarnos comisiones.',
} as const;

export const GENERAL_COMMISSION_NOTICE = 'ITC Club puede recibir una comisión si reservas o compras a través de este enlace, sin costo adicional para ti.';

export function partnerDisclosure(offer: string | null | undefined, hasExternalLink = false): string | null {
  if (offer === 'founding' || offer === 'strategic') return PARTNER_DISCLOSURES[offer];
  return hasExternalLink ? GENERAL_COMMISSION_NOTICE : null;
}
