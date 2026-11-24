import { publicSavedExperience } from '../lib/privateBenefits';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveAccountLocalItem } from '../lib/accountLocalData';
import { syncSavedExperiences } from '../lib/pushNotifications';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Alert } from 'react-native';
import { useLanguage } from './LanguageContext';
import { useAuth } from './AuthContext';
import type { Experience } from '../constants/experiences';
import type { NewsCard } from '../lib/news';

export type SavedItem = { key: string; id: string; kind: 'experience' | 'plan'; canSave?: boolean; title: string; image: string | null; experience?: Experience; plan?: NewsCard };
export const savedExperience = (item: Experience): SavedItem => ({ key: `experience:${item.id}`, id: item.id, kind: 'experience', canSave: !['ny_al_dia', 'ny-al-dia'].includes(item.section || ''), title: item.title, image: item.image, experience: publicSavedExperience(item) });
export const savedPlan = (item: NewsCard): SavedItem => ({ key: `plan:${item.id}`, id: String(item.id), kind: 'plan', title: item.title, image: item.image, plan: { id: item.id, title: item.title, excerpt: item.excerpt, image: item.image, date: item.date, link: item.link } });
const Context = createContext<{ items: SavedItem[]; ready: boolean; toggle: (item: SavedItem) => Promise<void> }>({ items: [], ready: false, toggle: async () => {} });

export function SavedProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  const { ui } = useLanguage();
  const storageKey = `itc:saved:${user?.id ?? 'guest'}`;
  const [state, setState] = useState<{ key: string; items: SavedItem[]; ready: boolean }>({ key: '', items: [], ready: false });
  const current = useRef(state);
  const queue = useRef(Promise.resolve());
  useEffect(() => {
    let active = true;
    current.current = { key: storageKey, items: [], ready: false };
    setState(current.current);
    AsyncStorage.getItem(storageKey).then((raw) => {
      const parsed: SavedItem[] = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed)) throw new Error('Invalid saved items');
      if (active) {
        current.current = { key: storageKey, items: parsed.map(item => item?.experience ? { ...item, experience: publicSavedExperience(item.experience) } : item).filter(item => item && ['experience', 'plan'].includes(item.kind) && item.canSave !== false && item.id !== 'nyc-local-guides'), ready: true };
        setState(current.current);
        queue.current = queue.current.then(async () => {
          if (active && current.current.key === storageKey) await saveAccountLocalItem(storageKey, JSON.stringify(current.current.items));
        }).catch(() => {});
      }
    }).catch(() => { if (active) Alert.alert(ui('Guardados'), ui('No se pudieron cargar tus guardados.')); });
    return () => { active = false; };
  }, [storageKey, ui]);
  // Saved experiences stay on the device unless the server needs them for reminders: the automation is on,
  // this person accepts reminders and has a registered device. Otherwise nothing is sent.
  const savedSync = user?.notification_preferences?.savedSync === true;
  const savedIds = state.key === storageKey && state.ready && user
    ? state.items.filter((item) => item.kind === 'experience').map((item) => item.id).sort().join('|') : null;
  const lastSynced = useRef<string | null>(null);
  useEffect(() => {
    if (!savedSync) lastSynced.current = null; // the server deletes its copy; send it again if this is turned back on
    if (savedIds === null || !token || !savedSync) return;
    const signature = `${storageKey}:${savedIds}`;
    if (lastSynced.current === signature) return;
    const timer = setTimeout(() => {
      syncSavedExperiences(token, savedIds ? savedIds.split('|') : [])
        .then(() => { lastSynced.current = signature; })
        .catch(() => undefined);
    }, 1500);
    return () => clearTimeout(timer);
  }, [savedIds, savedSync, storageKey, token]);
  const toggle = (item: SavedItem) => {
    queue.current = queue.current.then(async () => {
      if (item.canSave === false || !current.current.ready || current.current.key !== storageKey) return;
      const items = current.current.items.some(entry => entry.key === item.key)
        ? current.current.items.filter(entry => entry.key !== item.key) : [item, ...current.current.items];
      try {
        await saveAccountLocalItem(storageKey, JSON.stringify(items));
        if (current.current.key === storageKey) { current.current = { key: storageKey, items, ready: true }; setState(current.current); }
      } catch { Alert.alert(ui('Guardados'), ui('No se pudo guardar el cambio. Inténtalo otra vez.')); }
    });
    return queue.current;
  };
  return <Context.Provider value={{ items: state.key === storageKey ? state.items : [], ready: state.key === storageKey && state.ready, toggle }}>{children}</Context.Provider>;
}
export const useSaved = () => useContext(Context);
