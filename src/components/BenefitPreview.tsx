import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { savedExperience } from '../context/SavedContext';
import { SaveButton } from './SaveButton';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { AccessibilityInfo, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Experience } from '../constants/experiences';
import { useLanguage } from '../context/LanguageContext';
import { getExperienceTags } from '../lib/experienceFilters';
import { NewsImage } from './NewsImage';

export function BenefitPreview({ experience, width }: { experience: Experience; width: number }) {
  const { ui, tagLabel } = useLanguage();
  const { fontScale } = useResponsiveLayout();
  const photos = Array.from(new Set([experience.image, ...(experience.images ?? [])].filter(Boolean)));
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(true);
  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(value => { if (active) setReduceMotion(value); });
    const listener = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => { active = false; listener.remove(); };
  }, []);
  useFocusEffect(useCallback(() => {
    if (paused || reduceMotion || photos.length < 2) return;
    const timer = setInterval(() => setIndex(current => (current + 1) % photos.length), 4500);
    return () => clearInterval(timer);
  }, [paused, reduceMotion, photos.length]));
  const benefit = experience.cardBenefit?.trim() || experience.memberBenefit?.trim();
  return <View style={[s.card, { width }]}>
    <TouchableOpacity style={[s.imageWrap, { minHeight: Math.max(230, 170 * fontScale) }]} activeOpacity={0.85} accessibilityRole="button"
      accessibilityLabel={ui('Abrir {title}', { title: experience.title })}
      onPress={() => router.push({ pathname: '/experience-detail', params: { id: experience.id } })}>
      <NewsImage uri={photos[index] || experience.image} style={s.image} accessibilityLabel={experience.title} />
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.92)']} locations={[0, 0.4, 1]} style={StyleSheet.absoluteFill} />
      <View style={s.body}>
        <Text style={s.title} numberOfLines={2}>{experience.title}</Text>
        <Text style={s.description} numberOfLines={1}>{getExperienceTags(experience).map(tagLabel).join(' · ') || experience.category}</Text>
        <View style={s.region}><Ionicons name="location-outline" size={16} color="#FFFFFF" /><Text style={s.description}>{experience.region ?? 'NY'}</Text></View>
      </View>
    </TouchableOpacity>
    {!!benefit && <View style={s.badge} pointerEvents="none"><Ionicons name="pricetag" size={14} color="#FDDD56" /><Text style={s.badgeText} numberOfLines={1}>{benefit}</Text></View>}
    <SaveButton item={savedExperience(experience)} />
    {photos.length > 1 && <>
      <View style={s.indicators}>{photos.map((photo, i) => <TouchableOpacity key={photo} style={[s.dotTap, { width: Math.min(32, (width - 16) / photos.length) }]}
        accessibilityRole="button" accessibilityLabel={`${ui('Foto')} ${i + 1} / ${photos.length}`} accessibilityState={{ selected: index === i }}
        onPress={() => { setPaused(true); setIndex(i); }}><View style={[s.dot, index === i && s.active]} /></TouchableOpacity>)}</View>
    </>}
  </View>;
}
const s = StyleSheet.create({
  card: { overflow: 'hidden', marginRight: 12, borderRadius: 16, backgroundColor: '#121212' },
  imageWrap: { width: '100%', aspectRatio: 1.36, minHeight: 230 },
  image: { width: '100%', height: '100%' },
  body: { position: 'absolute', bottom: 38, left: 14, right: 14, gap: 5 },
  title: { color: '#FFFFFF', fontSize: 19, lineHeight: 24, fontWeight: '700' },
  description: { color: '#E0E0E0', fontSize: 13, lineHeight: 18 },
  region: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  badge: { position: 'absolute', top: 12, left: 12, maxWidth: '72%', flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.65)' },
  badgeText: { flexShrink: 1, color: '#FFFFFF', fontSize: 12, lineHeight: 17, fontWeight: '600' },
  indicators: { position: 'absolute', bottom: 0, left: 8, flexDirection: 'row' },
  dotTap: { width: 32, height: 36, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 24, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.35)' },
  active: { backgroundColor: '#FDDD56' },
});
