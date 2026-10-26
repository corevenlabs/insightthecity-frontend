export type SocialUrls = { instagramUrl?: string | null; tiktokUrl?: string | null; facebookUrl?: string | null };
export function experienceSocialLinks(experience: SocialUrls) {
  const networks = [
    { field: 'instagramUrl', label: 'Instagram', icon: 'logo-instagram', domain: 'instagram.com' },
    { field: 'tiktokUrl', label: 'TikTok', icon: 'logo-tiktok', domain: 'tiktok.com' },
    { field: 'facebookUrl', label: 'Facebook', icon: 'logo-facebook', domain: 'facebook.com' },
  ] as const;
  return networks.flatMap(network => {
    const raw = experience[network.field];
    if (!raw || typeof raw !== 'string') return [];
    try {
      const url = new URL(raw);
      const hosts: string[] = [network.domain, `www.${network.domain}`, ...(network.field === 'facebookUrl' ? ['m.facebook.com'] : [])];
      if (url.protocol !== 'https:' || !hosts.includes(url.hostname) || url.username || url.password || url.port || !url.pathname.replace(/\//g, '')
        || /^\/(?:l\.php|sharer(?:\.php)?|share|login|accounts)(?:\/|$)/i.test(url.pathname)) return [];
      return [{ label: network.label, icon: network.icon, url: url.href }];
    } catch { return []; }
  });
}
