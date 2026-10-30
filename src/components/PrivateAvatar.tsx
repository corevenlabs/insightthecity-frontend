import { useEffect, useState, type ReactNode } from 'react';
import { Image } from 'expo-image';
import { API_URL } from '../constants/api';

/** Profile image bytes remain in memory and are fetched only with the owner's credentials. */
export function PrivateAvatar({ url, token, style, fallback = null }: { url: string; token: string | null; style: import('react-native').StyleProp<import('react-native').ImageStyle>; fallback?: ReactNode }) {
  const [photo, setPhoto] = useState<{url:string;token:string|null;uri:string}|null>(null);
  useEffect(() => {
    const abort = new AbortController();
    if (!token || !url.startsWith('/api/users/me/avatar?')) return;
    void fetch(`${API_URL}${url}&format=json`, {headers:{Authorization:`Bearer ${token}`}, signal:abort.signal,cache:'no-store'})
      .then(async response => {if(!response.ok) throw Error('Avatar unavailable');return response.json();})
      .then(data => {if(!abort.signal.aborted && typeof data.dataUrl==='string')setPhoto({url,token,uri:data.dataUrl});})
      .catch(() => undefined);
    return () => abort.abort();
  }, [url,token]);
  return photo?.url===url && photo?.token===token ? <Image source={{uri:photo.uri}} style={style} contentFit="cover" cachePolicy="none" /> : fallback;
}
