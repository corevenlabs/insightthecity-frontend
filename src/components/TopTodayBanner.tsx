import { Text } from './typography';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, AppState, Image, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import type { Experience } from '../constants/experiences';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { useLanguage } from '../context/LanguageContext';
import { topTodayExperiences } from '../lib/topToday';

/** Full-width editorial banner. No pagination indicators. */
export function TopTodayBanner({ experiences, visible = true }: { experiences: Experience[]; visible?: boolean }) {
  const { ui } = useLanguage();
  const { contentWidth, fontScale } = useResponsiveLayout();
  const [focused, setFocused] = useState(false);
  useFocusEffect(useCallback(() => { setFocused(true); return () => setFocused(false); }, []));
  const scroll = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);
  const [now, setNow] = useState(Date.now);
  const [failed, setFailed] = useState<string[]>([]);
  const [touching, setTouching] = useState(false);
  const [foreground, setForeground] = useState(AppState.currentState === 'active');
  // Begin paused until accessibility preferences have been read.
  const [reduceMotion, setReduceMotion] = useState(true);
  const [screenReader, setScreenReader] = useState(true);
  const picks = useMemo(() => topTodayExperiences(experiences.filter(item => !failed.includes(item.id + '|' + item.image)), now), [experiences, now, failed]);
  const ids = picks.map(item => item.id).join('|');
  const active = Math.min(index, Math.max(0, picks.length - 1));
  const slideWidth = Math.max(0, contentWidth - 2);
  const height = fontScale > 1.35 ? Math.ceil(36 + fontScale * 144) : contentWidth < 350 ? 170 : 160;

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then(value => { if (mounted) setReduceMotion(value); }).catch(() => {});
    // RN Web reports screen-reader enabled unconditionally; use motion/focus preferences there.
    if (Platform.OS === 'web') setScreenReader(false);
    else AccessibilityInfo.isScreenReaderEnabled().then(value => { if (mounted) setScreenReader(value); }).catch(() => {});
    const motion = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    const reader = AccessibilityInfo.addEventListener('screenReaderChanged', setScreenReader);
    const app = AppState.addEventListener('change', state => setForeground(state === 'active'));
    return () => { mounted = false; motion.remove(); reader.remove(); app.remove(); };
  }, []);

  // Expire editorial picks while Home remains open, including a single-slide banner.
  useEffect(() => {
    if (!focused || !foreground || !visible) return;
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [focused, foreground, visible]);

  useEffect(() => {
    setIndex(0);
    scroll.current?.scrollTo({ x: 0, animated: false });
  }, [ids, contentWidth, visible]);

  function goTo(next: number, animate = true) {
    if (!picks.length) return;
    const target = (next + picks.length) % picks.length;
    setIndex(target);
    scroll.current?.scrollTo({ x: target * slideWidth, animated: animate && !reduceMotion });
  }

  useEffect(() => {
    if (!focused || !foreground || !visible || touching || reduceMotion || screenReader || picks.length < 2) return;
    const timer = setTimeout(() => {
      const target = (active + 1) % picks.length;
      setIndex(target);
      scroll.current?.scrollTo({ x: target * slideWidth, animated: true });
    }, 5000);
    return () => clearTimeout(timer);
  }, [focused, foreground, visible, touching, reduceMotion, screenReader, active, ids, picks.length, slideWidth]);

  if (!picks.length || !visible) return null;
  return <View style={styles.section}>
    <View style={[styles.frame, { width: contentWidth, height }]}>
      <ScrollView ref={scroll} horizontal pagingEnabled showsHorizontalScrollIndicator={false}
        scrollEnabled={picks.length > 1} bounces={false} decelerationRate="fast"
        onTouchStart={() => setTouching(true)} onTouchEnd={() => setTouching(false)} onTouchCancel={() => setTouching(false)}
        onScrollBeginDrag={() => setTouching(true)}
        onScrollEndDrag={() => setTouching(false)}
        onMomentumScrollEnd={event => setIndex(Math.min(picks.length - 1, Math.round(event.nativeEvent.contentOffset.x / Math.max(1, slideWidth))))}>
        {picks.map((item, position) => <Pressable key={item.id}
          style={({ pressed }) => [styles.slide, { width: slideWidth, height: height - 2, opacity: pressed ? 0.84 : 1 }]}
          accessibilityRole="button" accessibilityLabel={ui('Top de hoy: {title}', { title: item.title })}
          accessibilityHint={ui('Abre la ficha de esta atracción.')}
          aria-hidden={position !== active} accessible={position === active} accessibilityElementsHidden={position !== active}
          importantForAccessibility={position === active ? 'auto' : 'no-hide-descendants'}
          accessibilityActions={picks.length > 1 ? [{ name: 'increment', label: ui('Siguiente atracción') }, { name: 'decrement', label: ui('Atracción anterior') }] : []}
          onAccessibilityAction={event => goTo(active + (event.nativeEvent.actionName === 'increment' ? 1 : -1))}
          onHoverIn={() => setTouching(true)} onHoverOut={() => setTouching(false)} onFocus={() => setTouching(true)} onBlur={() => setTouching(false)}
          onPress={() => { setTouching(false); router.push({ pathname: '/experience-detail', params: { id: item.id } }); }}>
          <Image source={{ uri: item.image }} style={StyleSheet.absoluteFill} resizeMode="cover" accessible={false}
            onError={() => setFailed(current => current.includes(item.id + '|' + item.image) ? current : [...current, item.id + '|' + item.image])} />
          <LinearGradient colors={['rgba(0,0,0,0.88)', 'rgba(0,0,0,0.65)', 'rgba(0,0,0,0.28)']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={StyleSheet.absoluteFill} />
          <View style={styles.copy}>
            <Text variant="banner" style={styles.eyebrow}>{ui('TOP DE HOY')}</Text>
            <View style={styles.row}><View style={styles.text}>
              <Text variant="banner" style={styles.title} numberOfLines={fontScale > 1.35 ? 3 : 2}>{item.title}</Text>
              {!!item.description && <Text style={styles.description} numberOfLines={2}>{item.description}</Text>}
            </View><Ionicons name="chevron-forward" size={30} color="#FFFFFF" accessible={false} /></View>
          </View>
        </Pressable>)}
      </ScrollView>

    </View>
  </View>;
}
const styles = StyleSheet.create({
  section: { marginTop: 24 }, frame: { borderRadius: 18, overflow: 'hidden', backgroundColor: '#151515', borderWidth: 1, borderColor: '#2B2B2B' },
  slide: { justifyContent: 'center' }, copy: { paddingHorizontal: 18, paddingVertical: 16, gap: 6 },
  eyebrow: { color: '#FDDD56', fontSize: 12, lineHeight: 18, fontWeight: '800' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 }, text: { flex: 1, minWidth: 0, gap: 6 },
  title: { color: '#FFFFFF', fontSize: 22, lineHeight: 26, fontWeight: '800' },
  description: { color: '#E2E2E2', fontSize: 13, lineHeight: 18 },
});
