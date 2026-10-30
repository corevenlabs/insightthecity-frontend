import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, AppState, FlatList, Image, Pressable, StyleSheet, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { Text } from './typography';
import { useLanguage } from '../context/LanguageContext';

/** Duplicate end slides let both autoplay and manual swipes cross the boundary seamlessly. */
export function PublicationGallery({ photos, width, height }: { photos: string[]; width: number; height: number }) {
  const { ui } = useLanguage();
  const count = photos.length;
  const loop = count > 1;
  const data = loop ? [photos[count - 1], ...photos, photos[0]] : photos;
  const list = useRef<FlatList<string>>(null);
  const position = useRef(loop ? 1 : 0);
  const dragging = useRef(false);
  const moving = useRef(false);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(true);
  const [appActive, setAppActive] = useState(AppState.currentState === 'active');
  const clearSettle = useCallback(() => {
    if (settleTimer.current) clearTimeout(settleTimer.current);
    settleTimer.current = null;
  }, []);
  useFocusEffect(useCallback(() => () => { clearSettle(); moving.current = false; dragging.current = false; }, [clearSettle]));
  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(value => { if (active) setReduceMotion(value); }).catch(() => undefined);
    const motion = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    const app = AppState.addEventListener('change', state => setAppActive(state === 'active'));
    return () => { active = false; motion.remove(); app.remove(); clearSettle(); };
  }, [clearSettle]);
  const settle = useCallback((offset: number) => {
    clearSettle();
    let next = Math.max(0, Math.min(data.length - 1, Math.round(offset / width)));
    if (loop && (next === 0 || next === count + 1)) {
      next = next === 0 ? count : 1;
      list.current?.scrollToOffset({ offset: next * width, animated: false });
    }
    position.current = next;
    setIndex(loop ? next - 1 : 0);
    moving.current = false;
    dragging.current = false;
  }, [clearSettle, count, data.length, loop, width]);
  useFocusEffect(useCallback(() => {
    if (!loop || paused || reduceMotion || !appActive) return;
    const timer = setInterval(() => {
      if (dragging.current || moving.current || !list.current) return;
      moving.current = true;
      const offset = (position.current + 1) * width;
      list.current.scrollToOffset({ offset, animated: true });
      // Some platforms omit momentum-end for programmatic scrolling.
      clearSettle();
      settleTimer.current = setTimeout(() => settle(offset), 900);
    }, 4500);
    return () => { clearInterval(timer); clearSettle(); moving.current = false; dragging.current = false; };
  }, [appActive, clearSettle, loop, paused, reduceMotion, settle, width]));
  function endDrag(event: NativeSyntheticEvent<NativeScrollEvent>) {
    clearSettle();
    const offset = event.nativeEvent.contentOffset.x;
    settleTimer.current = setTimeout(() => settle(offset), 900);
  }
  return <View style={{ width, height }}>
    <FlatList
      ref={list}
      data={data}
      horizontal
      pagingEnabled
      initialScrollIndex={loop ? 1 : 0}
      getItemLayout={(_, itemIndex) => ({ length: width, offset: width * itemIndex, index: itemIndex })}
      scrollEnabled={loop}
      showsHorizontalScrollIndicator={false}
      keyExtractor={(url, itemIndex) => `${itemIndex}-${url}`}
      renderItem={({ item }) => <Image source={{ uri: item }} style={{ width, height }} resizeMode="cover" />}
      onScrollBeginDrag={() => { clearSettle(); dragging.current = true; moving.current = false; }}
      onScrollEndDrag={endDrag}
      onMomentumScrollEnd={event => settle(event.nativeEvent.contentOffset.x)}
    />
    {loop && <View style={styles.controls}>
      <Text style={styles.count}>{index + 1}/{count}</Text>
      {!reduceMotion && <Pressable accessibilityRole="button" accessibilityLabel={ui(paused ? 'Reanudar galería' : 'Pausar galería')} onPress={() => setPaused(value => !value)} style={({ pressed }) => [styles.pause, pressed && { opacity: 0.65 }]}>
        <Ionicons name={paused ? 'play' : 'pause'} size={15} color="#FFF" />
      </Pressable>}
    </View>}
  </View>;
}
const styles = StyleSheet.create({
  controls: { position: 'absolute', top: 60, right: 20, flexDirection: 'row', alignItems: 'center', paddingLeft: 10, paddingRight: 4, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.72)', zIndex: 3 },
  count: { color: '#FFF', fontSize: 12, fontWeight: '800', paddingVertical: 8 },
  pause: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
