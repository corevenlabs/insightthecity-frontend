import { useCallback, useState } from 'react';
import { AccessibilityInfo, Animated, Easing } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { consumeHomeEntrance, subscribeHomeEntrance } from '../lib/homeEntrance';

export function useHomeEntrance(userId: number | undefined) {
  const [values] = useState(() => [new Animated.Value(1), new Animated.Value(1), new Animated.Value(1)]);
  useFocusEffect(useCallback(() => {
    let dispose: (() => void) | undefined;
    const play = () => {
      if (!consumeHomeEntrance(userId)) return;
      dispose?.();
      let active = true, settled = false, reduced = false;
      const animations: Animated.CompositeAnimation[] = [];
      const finish = () => {
        settled = true;
        animations.forEach(animation => animation.stop());
        values.forEach(value => value.setValue(1));
      };
      values.forEach(value => value.setValue(0));
      // Accessibility lookup must never leave the Home hidden if the native bridge stalls.
      const fallback = setTimeout(finish, 150);
      const listener = AccessibilityInfo.addEventListener('reduceMotionChanged', enabled => {
        reduced = enabled;
        if (enabled) finish();
      });
      void AccessibilityInfo.isReduceMotionEnabled().then(enabled => {
        if (!active || settled) return;
        clearTimeout(fallback);
        if (enabled || reduced) return finish();
        values.forEach((value, index) => {
          const animation = Animated.timing(value, {
            toValue: 1, duration: 300, delay: index * 70,
            easing: Easing.out(Easing.cubic), useNativeDriver: true, isInteraction: false,
          });
          animations.push(animation);
          animation.start();
        });
      }).catch(() => { if (active) { clearTimeout(fallback); finish(); } });
      dispose = () => { active = false; clearTimeout(fallback); listener.remove(); finish(); };
    };
    // A biometric unlock can finish over the focused Home without another focus event.
    const unsubscribe = subscribeHomeEntrance(play);
    play();
    return () => { unsubscribe(); dispose?.(); };
  }, [userId, values]));
  return values.map(opacity => ({ opacity, transform: [{ translateY: opacity.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] }));
}
