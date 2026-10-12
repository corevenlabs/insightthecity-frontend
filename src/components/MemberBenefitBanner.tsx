import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, AppState, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import type { Experience } from '../constants/experiences';
import { useLanguage } from '../context/LanguageContext';

export function MemberBenefitBanner({ items, height = 210 }: { items: Experience[]; height?: number }) {
  const { ui } = useLanguage();
  const { fontScale } = useWindowDimensions();
  const [focused, setFocused] = useState(false);
  useFocusEffect(useCallback(() => { setFocused(true); return () => setFocused(false); }, []));
  const scroll = useRef<ScrollView>(null);
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [active, setActive] = useState(AppState.currentState === 'active');
  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(value => { if (mounted) setReducedMotion(value); });
    const motion = AccessibilityInfo.addEventListener('reduceMotionChanged', setReducedMotion);
    const app = AppState.addEventListener('change', value => setActive(value === 'active'));
    return () => { mounted = false; motion.remove(); app.remove(); };
  }, []);
  const safeIndex = Math.min(index, Math.max(0, items.length - 1));
  const move = (next: number) => { scroll.current?.scrollTo({ x: next * width, animated: !reducedMotion }); setIndex(next); };
  useEffect(() => {
    if (!focused || !active || paused || reducedMotion || !width || items.length < 2) return;
    const timer = setInterval(() => {
      const next = (safeIndex + 1) % items.length;
      scroll.current?.scrollTo({ x: next * width, animated: true });
      setIndex(next);
    }, 6000);
    return () => clearInterval(timer);
  }, [focused, active, paused, reducedMotion, width, safeIndex, items.length]);
  if (!items.length) return <Text style={styles.empty}>{ui('No hay beneficios disponibles en este momento. Vuelve a consultar antes de suscribirte.')}</Text>;
  return <View onLayout={event => { const nextWidth = event.nativeEvent.layout.width; setWidth(nextWidth); scroll.current?.scrollTo({ x: safeIndex * nextWidth, animated: false }); }}>
    <ScrollView ref={scroll} horizontal pagingEnabled showsHorizontalScrollIndicator={false}
      scrollEventThrottle={16}
      onMomentumScrollEnd={event => { if (width) setIndex(Math.round(event.nativeEvent.contentOffset.x / width)); }}>
      {items.map(item => <Pressable key={item.id} style={{ width: width || 1 }} accessibilityRole="button"
        accessibilityLabel={`${item.title}. ${item.memberBenefit || ''}. ${ui('Ver beneficio')}`}
        onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
        accessibilityActions={[{ name: 'increment', label: ui('Siguiente beneficio') }, { name: 'decrement', label: ui('Beneficio anterior') }]}
        onAccessibilityAction={event => { setPaused(true); move((safeIndex + (event.nativeEvent.actionName === 'decrement' ? -1 : 1) + items.length) % items.length); }}
        onPress={() => router.push({ pathname: '/experience-detail', params: { id: item.id } })}>
        <ImageBackground source={{ uri: item.image }} style={[styles.banner, { height: height * Math.max(1, fontScale) }]} imageStyle={styles.image}>
          <View style={styles.overlay}>
            <Text style={styles.badge}>{ui('BENEFICIO ITC CLUB')}</Text>
            <View style={styles.copy}>
              <Text style={styles.offer} numberOfLines={2}>{item.memberBenefit}</Text>
              <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                            <Text style={styles.link}>{ui('Ver beneficio')} →</Text>
            </View>
          </View>
        </ImageBackground>
      </Pressable>)}
    </ScrollView>

  </View>;
}
const styles = StyleSheet.create({
  banner: { height: 210, backgroundColor: '#161616', borderRadius: 20, overflow: 'hidden' }, image: { borderRadius: 20 },
  overlay: { flex: 1, padding: 16, justifyContent: 'space-between', backgroundColor: 'rgba(0,0,0,0.62)' },
  badge: { color: '#0A0A0A', backgroundColor: '#FDDD56', borderRadius: 8, padding: 6, alignSelf: 'flex-start', fontWeight: '800', fontSize: 11 },
  copy: { gap: 4 }, offer: { color: '#FDDD56', fontSize: 24, fontWeight: '800', lineHeight: 29 }, title: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  location: { color: '#DDD', fontSize: 13 }, details: { color: '#DDD', fontSize: 14, lineHeight: 20 }, link: { color: '#FDDD56', fontSize: 14, fontWeight: '700', marginTop: 5 },
  empty: { color: '#AAA', fontSize: 14, lineHeight: 22, paddingVertical: 20 }, controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 },
  count: { color: '#AAA', fontSize: 13 }, buttons: { flexDirection: 'row', gap: 8 }, control: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#191919', alignItems: 'center', justifyContent: 'center' },
});
