import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '../context/LanguageContext';

export function HomePromotion() {
  const { ui } = useLanguage();
  const [hidden, setHidden] = useState(false);
  const [closing, setClosing] = useState(false);
  const [height, setHeight] = useState(64);
  const [progress] = useState(() => new Animated.Value(1));
  const [contents] = useState(() => new Animated.Value(1));
  const [logo] = useState(() => new Animated.Value(0));
  async function close() {
    if (closing) return;
    setClosing(true);
    const reduceMotion = await AccessibilityInfo.isReduceMotionEnabled();
    if (reduceMotion) return setHidden(true);
    Animated.sequence([
      Animated.parallel([
        Animated.timing(contents, { toValue: 0, duration: 140, useNativeDriver: false }),
        Animated.timing(logo, { toValue: 1, duration: 140, useNativeDriver: false }),
      ]),
      Animated.parallel([
        Animated.timing(logo, { toValue: 0, duration: 280, useNativeDriver: false }),
        Animated.timing(progress, { toValue: 0, duration: 360, easing: Easing.inOut(Easing.cubic), useNativeDriver: false }),
      ]),
    ]).start(({ finished }) => { if (finished) setHidden(true); });
  }
  if (hidden) return null;
  const brand = <><Text style={{ color: '#FFFFFF' }}>ITC </Text><Text style={{ color: '#D4AF37' }}>CLUB</Text></>;
  return <Animated.View pointerEvents={closing ? 'none' : 'auto'} accessibilityElementsHidden={closing}
    importantForAccessibility={closing ? 'no-hide-descendants' : 'auto'}
    style={{ overflow: 'hidden', marginTop: progress.interpolate({ inputRange: [0, 1], outputRange: [0, 16] }),
      height: closing ? progress.interpolate({ inputRange: [0, 1], outputRange: [0, height] }) : undefined }}>
    <View style={s.banner} onLayout={event => { if (!closing) setHeight(event.nativeEvent.layout.height); }}>
      <Animated.View style={[s.row, { opacity: contents }]}>
        <Text style={s.brand} numberOfLines={1}>{brand}</Text>
        <Text style={s.message} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>{ui('Beneficios cerca de ti')}</Text>
        <TouchableOpacity style={s.button} accessibilityRole="button" accessibilityLabel={ui('Ver beneficios')} onPress={() => router.push('/club')}>
          <Text style={s.buttonText} numberOfLines={1}>{ui('Ver más')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.close} accessibilityRole="button" accessibilityLabel={ui('Cerrar')} onPress={() => void close()}>
          <Ionicons name="close-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>
      {closing && <Animated.View pointerEvents="none" style={[s.logo, { opacity: logo, transform: [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1] }) }] }]}>
        <Text style={s.brand}>{brand}</Text>
      </Animated.View>}
    </View>
  </Animated.View>;
}
const s = StyleSheet.create({
  banner: { minHeight: 64, borderRadius: 14, borderWidth: 1, borderColor: '#D4AF37', backgroundColor: '#0F0F0F' },
  row: { minHeight: 62, flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 10, paddingRight: 2 },
  brand: { fontSize: 18, lineHeight: 24, fontWeight: '800', letterSpacing: -0.8 },
  message: { flex: 1, minWidth: 0, color: '#FFFFFF', fontSize: 13, lineHeight: 18 },
  button: { minHeight: 44, paddingHorizontal: 10, justifyContent: 'center', backgroundColor: '#D4AF37', borderRadius: 24 },
  buttonText: { color: '#050505', fontSize: 12, fontWeight: '700' },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  logo: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
});
