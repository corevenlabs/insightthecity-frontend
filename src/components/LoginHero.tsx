import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
const ART = require('../../assets/videos/itc-welcome-final.jpg');
export function LoginHero({ height, width }: { height: number; width: number }) {
  return <View style={{ height, overflow: 'hidden' }}>
    <View style={{ height, width: Math.min(width, height * 1.35), alignSelf: 'center' }}>
      <Image source={ART} style={StyleSheet.absoluteFill} contentFit="cover" accessibilityLabel="ITC CLUB · New York" accessibilityRole="image" />
      <View pointerEvents="none" style={[styles.blur, { height: height * 0.17 }]}>
        <Image source={ART} blurRadius={7} style={{ position: 'absolute', width: '100%', height, bottom: 0 }} contentFit="cover" accessible={false} />
      </View>
      <LinearGradient pointerEvents="none" colors={['transparent', 'rgba(10,10,10,0.18)', '#0A0A0A']} locations={[0, 0.4, 1]} style={[styles.fade, { height: height * 0.36 }]} />
    </View>
  </View>;
}
const styles = StyleSheet.create({
  blur: { position: 'absolute', bottom: 0, left: 0, right: 0, overflow: 'hidden' },
  fade: { position: 'absolute', bottom: -1, left: 0, right: 0 },
});
