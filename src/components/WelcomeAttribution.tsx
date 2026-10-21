import { useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { Text } from './typography';

// The original hero is 720 x 1280. Its CLUB wordmark ends around y=805.
// Match the centered cover crop rather than changing or redrawing the logo asset.
export function WelcomeAttribution() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  function measure(event: LayoutChangeEvent) {
    const { width, height } = event.nativeEvent.layout;
    setSize(current => current.width === width && current.height === height ? current : { width, height });
  }
  const scale = Math.max(size.width / 720, size.height / 1280);
  const imageLeft = (size.width - 720 * scale) / 2;
  const imageTop = (size.height - 1280 * scale) / 2;
  const logoWidth = Math.min(size.width - 24, 506 * scale);
  const fontSize = Math.max(12, Math.min(18, logoWidth * 0.052));
  return <View pointerEvents="none" onLayout={measure} style={StyleSheet.absoluteFill}>
    {size.width > 0 && <Text style={[styles.byline, {
      left: Math.max(12, imageLeft + 108 * scale),
      top: imageTop + 805 * scale + 6,
      width: logoWidth,
      fontSize,
      lineHeight: fontSize * 1.5,
    }]}>by Insight The City</Text>}
  </View>;
}
const styles = StyleSheet.create({
  byline: { position: 'absolute', color: '#C8C8C8', fontWeight: '400', letterSpacing: 0.9, textAlign: 'center' },
});
