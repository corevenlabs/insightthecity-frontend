export type EventLocation = { region?: 'NY' | 'NJ'; location?: string | null; shortAddress?: string | null; mapsUrl?: string | null };

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

export function eventMapsUrl(event: EventLocation): string | null {
  const explicit = validMapsUrl(event.mapsUrl);
  if (explicit) return explicit;
  const address = event.location?.trim() || event.shortAddress?.trim();
  if (!address) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address}, ${event.region === 'NJ' ? 'New Jersey' : 'New York'}, USA`)}`;
}
