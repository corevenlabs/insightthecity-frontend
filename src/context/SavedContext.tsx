import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Alert } from 'react-native';
import { useAuth } from './AuthContext';
import type { Experience } from '../constants/experiences';
import type { NewsCard } from '../lib/news';

export type SavedItem = { key: string; id: string; kind: 'experience' | 'plan'; canSave?: boolean; title: string; image: string | null };
export const savedExperience = (item: Experience): SavedItem => ({ key: `experience:${item.id}`, id: item.id, kind: 'experience', canSave: !['ny_al_dia', 'guias', 'ny-al-dia', 'guides'].includes(item.section || ''), title: item.title, image: item.image });
export const savedPlan = (item: NewsCard): SavedItem => ({ key: `plan:${item.id}`, id: String(item.id), kind: 'plan', title: item.title, image: item.image });
const Context = createContext<{ items: SavedItem[]; ready: boolean; toggle: (item: SavedItem) => Promise<void> }>({ items: [], ready: false, toggle: async () => {} });

export function SavedProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
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
        current.current = { key: storageKey, items: parsed.filter(item => item && ['experience', 'plan'].includes(item.kind) && item.canSave !== false), ready: true };
        setState(current.current);
      }
    }).catch(() => { if (active) Alert.alert('Guardados', 'No se pudieron cargar tus guardados.'); });
    return () => { active = false; };
  }, [storageKey]);
  const toggle = (item: SavedItem) => {
    queue.current = queue.current.then(async () => {
      if (item.canSave === false || !current.current.ready || current.current.key !== storageKey) return;
      const items = current.current.items.some(entry => entry.key === item.key)
        ? current.current.items.filter(entry => entry.key !== item.key) : [item, ...current.current.items];
      try {
        await AsyncStorage.setItem(storageKey, JSON.stringify(items));
        if (current.current.key === storageKey) { current.current = { key: storageKey, items, ready: true }; setState(current.current); }
      } catch { Alert.alert('Guardados', 'No se pudo guardar el cambio. Inténtalo otra vez.'); }
    });
    return queue.current;
  };
  return <Context.Provider value={{ items: state.key === storageKey ? state.items : [], ready: state.key === storageKey && state.ready, toggle }}>{children}</Context.Provider>;
}
export const useSaved = () => useContext(Context);
