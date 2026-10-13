export const PARTNER_DISCLOSURES = {
  founding: 'Colaboración comercial pagada: este negocio paga por participar en ITC Club. Algunas compras o reservas también pueden generarnos comisiones.',
  strategic: 'Colaboración comercial: este socio ofrece beneficios exclusivos a miembros de ITC Club. Algunas compras o reservas pueden generarnos comisiones.',
} as const;

export function partnerDisclosure(offer: string | null | undefined): string | null {
  return offer === 'founding' || offer === 'strategic' ? PARTNER_DISCLOSURES[offer] : null;
}
