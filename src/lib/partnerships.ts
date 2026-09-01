import { API_URL } from '../constants/api';

export type FeaturedPartnership = {
  brandName: string;
  title: string;
  description: string | null;
  image: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  isPublished: boolean;
};

export const DEFAULT_FEATURED_PARTNERSHIP: FeaturedPartnership = {
  brandName: 'COCA-COLA',
  title: 'Comparte la magia de Nueva York con Coca-Cola',
  description:
    'Momentos refrescantes y experiencias especiales para disfrutar la ciudad juntos.',
  image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/af/Coca-cola_bottle.jpg/1280px-Coca-cola_bottle.jpg',
  ctaLabel: 'CONOCER MÁS',
  ctaUrl: 'https://www.coca-cola.com/us/en',
  isPublished: true,
};

export async function fetchFeaturedPartnership(): Promise<FeaturedPartnership | null> {
  const response = await fetch(`${API_URL}/api/partnerships/featured`);
  if (response.status === 404) throw new Error('Partnership todavía no disponible en la API.');
  if (!response.ok) throw new Error('No se pudo cargar el partnership destacado.');
  const data = (await response.json()) as {
    success: boolean;
    partnership: FeaturedPartnership;
  };
  return data.partnership?.isPublished ? data.partnership : null;
}
