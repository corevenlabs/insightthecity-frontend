import { useCallback, useEffect, useRef, useState } from 'react';
import { useLanguage, type AppLanguage } from '../context/LanguageContext';
import { API_URL } from '../constants/api';

// Contenido que vive en el WordPress del cliente, servido por nuestro backend
// (/api/news). La app no duplica nada: el cliente publica en WordPress y aparece acá.

export interface NewsCard {
  id: number;
  title: string;
  excerpt: string;
  originalTitle?: string;
  originalExcerpt?: string;
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
const WORDPRESS_API_URL = 'https://insightthecity.com/wp-json/wp/v2';
const SECTION_CATEGORIES: Record<string, number> = { 'ny-al-dia': 58, 'que-hacer': 84 };

function stripHtml(value: string = '') {
  return value.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#8217;/g, '’').replace(/\s+/g, ' ').trim();
}

function wordpressCard(post: any): NewsCard {
  const media = post?._embedded?.['wp:featuredmedia']?.[0];
  const sizes = media?.media_details?.sizes || {};
  return {
    id: post.id,
    title: stripHtml(post.title?.rendered),
    excerpt: stripHtml(post.excerpt?.rendered),
    image: sizes.large?.source_url || sizes.medium_large?.source_url || media?.source_url || null,
    date: post.date,
    link: post.link,
  };
}

async function fetchNewsFromWordPress(section: string, page: number, perPage: number): Promise<NewsPage> {
  const category = SECTION_CATEGORIES[section];
  if (!category) throw new Error('Sección desconocida.');
  const response = await fetch(`${WORDPRESS_API_URL}/posts?categories=${category}&page=${page}&per_page=${perPage}&_embed=1`);
  if (!response.ok) throw new Error('No se pudo cargar el contenido.');
  const posts = await response.json();
  return {
    items: posts.map(wordpressCard), page, perPage,
    total: Number(response.headers.get('x-wp-total')) || posts.length,
    totalPages: Number(response.headers.get('x-wp-totalpages')) || 1,
  };
}

export async function fetchNews(
  section: string,
  page = 1,
  perPage = PER_PAGE,
  language: AppLanguage = 'es',
): Promise<NewsPage> {
  try {
    const res = await fetch(
      `${API_URL}/api/news?section=${encodeURIComponent(section)}&page=${page}&perPage=${perPage}&lang=${language}`,
    );
    if (!res.ok) throw new Error('Backend de contenido no disponible.');
    const data = (await res.json()) as { success: boolean } & NewsPage;
    return {
      items: data.items ?? [], page: data.page ?? page, perPage: data.perPage ?? perPage,
      total: data.total ?? 0, totalPages: data.totalPages ?? 0,
    };
  } catch (error) {
    if (language !== 'es') throw error;
    return fetchNewsFromWordPress(section, page, perPage);
  }
}

export async function fetchArticle(id: number | string, language: AppLanguage = 'es'): Promise<NewsArticle> {
  try {
    const res = await fetch(`${API_URL}/api/news/${encodeURIComponent(String(id))}?lang=${language}`);
    if (!res.ok) throw new Error('Backend de contenido no disponible.');
    const data = (await res.json()) as { success: boolean; article: NewsArticle };
    return data.article;
  } catch (error) {
    if (language !== 'es') throw error;
    const fallback = await fetch(`${WORDPRESS_API_URL}/posts/${encodeURIComponent(String(id))}?_embed=1`);
    if (!fallback.ok) throw new Error('No se pudo cargar la nota.');
    const post = await fallback.json();
    return { ...wordpressCard(post), contentHtml: post.content?.rendered || '' };
  }
}

// Formatea la fecha ISO a algo corto tipo "28 Ago 2026".
export function formatDate(iso: string, language: 'es' | 'en' | 'pt' = 'es'): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString({ es: 'es-ES', en: 'en-US', pt: 'pt-BR' }[language], { day: 'numeric', month: 'short', year: 'numeric' });
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
  const { language } = useLanguage();
  const generation = useRef(0);
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
  const inFlight = useRef<number | null>(null);

  const load = useCallback(
    async (page: number, mode: 'initial' | 'more' | 'refresh') => {
      const current = generation.current;
      if (inFlight.current === current) return;
      inFlight.current = current;
      setState((s) => ({
        ...s,
        loading: mode === 'initial',
        loadingMore: mode === 'more',
        refreshing: mode === 'refresh',
        error: mode === 'initial' ? null : s.error,
      }));
      try {
        const res = await fetchNews(section, page, PER_PAGE, language);
        if (current !== generation.current) return;
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
        if (current !== generation.current) return;
        setState((s) => ({
          ...s,
          loading: false,
          loadingMore: false,
          refreshing: false,
          error: (e as Error).message,
        }));
      } finally {
        if (inFlight.current === current) inFlight.current = null;
      }
    },
    [section, language],
  );

  useEffect(() => {
    generation.current += 1;
    inFlight.current = null;
    setState(s => ({ ...s, items: [], hasMore: true }));
    pageRef.current = 1;
    void load(1, 'initial');
    return () => { generation.current += 1; };
  }, [load]);

  const loadMore = useCallback(() => {
    if (inFlight.current !== null || !state.hasMore) return;
    void load(pageRef.current + 1, 'more');
  }, [load, state.hasMore]);

  const refresh = useCallback(() => {
    pageRef.current = 1;
    void load(1, 'refresh');
  }, [load]);

  const retry = useCallback(() => {
    void load(1, 'initial');
    return () => { generation.current += 1; };
  }, [load]);

  return { ...state, loadMore, refresh, retry };
}
