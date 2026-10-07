import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { normalize } from './experienceFilters';

export function filterIcon(tag: string): ComponentProps<typeof Ionicons>['name'] {
  const value = normalize(tag);
  if (/^(ny|nj)$/.test(value)) return 'location-outline';
  if (/hoy|semana|evento/.test(value)) return 'calendar-outline';
  if (/food|comida|restaurante|gastronomia/.test(value)) return 'restaurant-outline';
  if (/muse|arte|cultura/.test(value)) return 'color-palette-outline';
  if (/music/.test(value)) return 'musical-notes-outline';
  if (/broadway/.test(value)) return 'ticket-outline';
  if (/night|noche/.test(value)) return 'moon-outline';
  if (/hotel/.test(value)) return 'bed-outline';
  if (/bienestar/.test(value)) return 'fitness-outline';
  if (/aire libre|parque/.test(value)) return 'leaf-outline';
  if (/compras/.test(value)) return 'bag-outline';
  if (/mirador/.test(value)) return 'eye-outline';
  if (/gratis|descuento|drop/.test(value)) return 'pricetag-outline';
  if (/guia/.test(value)) return 'book-outline';
  if (/dia/.test(value)) return 'newspaper-outline';
  return 'compass-outline';
}
