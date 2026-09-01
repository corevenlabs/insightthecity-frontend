import { useCallback, useEffect, useRef, useState } from 'react';
import { API_URL } from '../constants/api';

// Contenido que vive en el WordPress del cliente, servido por nuestro backend
// (/api/news). La app no duplica nada: el cliente publica en WordPress y aparece acá.

export interface NewsCard {
  id: number;
  title: string;
  excerpt: string;
  image: string | null;
  date: string; // ISO
  link: string;
}

export interface NewsArticle extends NewsCard {
  contentHtml: string;
}

export interface NewsPage {
  items: NewsCard[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

const PER_PAGE = 10;

export async function fetchNews(
  section: string,
  page = 1,
  perPage = PER_PAGE,
): Promise<NewsPage> {
  const res = await fetch(
    `${API_URL}/api/news?section=${encodeURIComponent(section)}&page=${page}&perPage=${perPage}`,
  );
  if (!res.ok) throw new Error('No se pudo cargar el contenido.');
  const data = (await res.json()) as { success: boolean } & NewsPage;
  return {
    items: data.items ?? [],
    page: data.page ?? page,
    perPage: data.perPage ?? perPage,
    total: data.total ?? 0,
    totalPages: data.totalPages ?? 0,
  };
}

export async function fetchArticle(id: number | string): Promise<NewsArticle> {
  const res = await fetch(`${API_URL}/api/news/${encodeURIComponent(String(id))}`);
  if (!res.ok) throw new Error('No se pudo cargar la nota.');
  const data = (await res.json()) as { success: boolean; article: NewsArticle };
  return data.article;
}

// Formatea la fecha ISO a algo corto tipo "28 Ago 2026".
const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
}

interface FeedState {
  items: NewsCard[];
  loading: boolean; // carga inicial
  loadingMore: boolean; // paginando
  refreshing: boolean; // pull-to-refresh
  error: string | null;
  hasMore: boolean;
}

// Hook de feed paginado con scroll infinito y pull-to-refresh, reusado por
// las pantallas "NY al día" y "Qué hacer en NY".
export function useNewsFeed(section: string) {
  const [state, setState] = useState<FeedState>({
    items: [],
    loading: true,
    loadingMore: false,
    refreshing: false,
    error: null,
    hasMore: true,
  });
  const pageRef = useRef(1);
  const totalPagesRef = useRef(1);
  const inFlight = useRef(false);

  const load = useCallback(
    async (page: number, mode: 'initial' | 'more' | 'refresh') => {
      if (inFlight.current) return;
      inFlight.current = true;
      setState((s) => ({
        ...s,
        loading: mode === 'initial',
        loadingMore: mode === 'more',
        refreshing: mode === 'refresh',
        error: mode === 'initial' ? null : s.error,
      }));
      try {
        const res = await fetchNews(section, page);
        pageRef.current = res.page;
        totalPagesRef.current = res.totalPages;
        setState((s) => ({
          items: mode === 'refresh' || mode === 'initial' ? res.items : [...s.items, ...res.items],
          loading: false,
          loadingMore: false,
          refreshing: false,
          error: null,
          hasMore: res.page < res.totalPages,
        }));
      } catch (e) {
        setState((s) => ({
          ...s,
          loading: false,
          loadingMore: false,
          refreshing: false,
          error: (e as Error).message,
        }));
      } finally {
        inFlight.current = false;
      }
    },
    [section],
  );

  useEffect(() => {
    pageRef.current = 1;
    void load(1, 'initial');
  }, [load]);

  const loadMore = useCallback(() => {
    if (inFlight.current || !state.hasMore) return;
    void load(pageRef.current + 1, 'more');
  }, [load, state.hasMore]);

  const refresh = useCallback(() => {
    pageRef.current = 1;
    void load(1, 'refresh');
  }, [load]);

  const retry = useCallback(() => {
    void load(1, 'initial');
  }, [load]);

  return { ...state, loadMore, refresh, retry };
}
