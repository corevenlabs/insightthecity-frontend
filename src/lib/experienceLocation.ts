export type BranchLocation = { name: string; address: string; placeId: string; benefitApplies: boolean };
export function branchMapsUrl(branches?: BranchLocation[]): string | null {
  if (!branches?.length) return null;
  const eligible = branches.filter(b => b.benefitApplies !== false);
  if (!eligible.length || eligible.length > 20 || eligible.some(b => !/^[A-Za-z0-9_-]{1,120}$/.test(b.placeId))) return null;
  const ids = [...new Set(eligible.map(b => b.placeId))];
  const url = ids.length > 1
    ? `https://www.google.com/maps/@?api=1&map_action=shortlist&place_ids=${ids.map(encodeURIComponent).join(',')}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(eligible[0].address || eligible[0].name)}&query_place_id=${encodeURIComponent(ids[0])}`;
  return url.length <= 2048 ? url : null;
}
export type EventLocation = { locations?: BranchLocation[]; region?: 'NY' | 'NJ'; location?: string | null; shortAddress?: string | null; mapsUrl?: string | null };

export function validMapsUrl(value?: string | null): string | null {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value.trim());
    const allowed = ['google.com', 'www.google.com'].includes(url.hostname) && url.pathname.startsWith('/maps')
      || ['maps.google.com', 'maps.app.goo.gl'].includes(url.hostname)
      || url.hostname === 'goo.gl' && url.pathname.startsWith('/maps/');
    return url.protocol === 'https:' && !url.username && !url.password && !url.port && allowed ? url.toString() : null;
  } catch { return null; }
}

export function sharedBranchMapUrl(value?: string | null): string | null {
  const valid = validMapsUrl(value);
  if (!valid) return null;
  const url = new URL(valid);
  return ['google.com', 'www.google.com'].includes(url.hostname) && /^\/maps\/d\/(?:u\/\d+\/)?(?:view|viewer|edit)$/.test(url.pathname) && url.searchParams.get('mid')
    ? `https://www.google.com/maps/d/viewer?mid=${encodeURIComponent(url.searchParams.get('mid')!)}` : null;
}

export function eventMapsUrl(event: EventLocation): string | null {
  if (event.locations?.length) {
    const eligible = event.locations.filter(item => item.benefitApplies !== false);
    // A shortlist may open a list first; use a shared map when several pins are required.
    if (eligible.length > 1) return sharedBranchMapUrl(event.mapsUrl);
    return branchMapsUrl(event.locations);
  }
  const explicit = validMapsUrl(event.mapsUrl);
  if (explicit) return explicit;
  const address = event.location?.trim() || event.shortAddress?.trim();
  if (!address) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address}, ${event.region === 'NJ' ? 'New Jersey' : 'New York'}, USA`)}`;
}
