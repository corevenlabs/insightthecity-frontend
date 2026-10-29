import { useLanguage } from '@/context/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleProp, StyleSheet, View, type ImageStyle } from 'react-native';

type NewsImageProps = {
  uri: string | null;
  style: StyleProp<ImageStyle>;
  accessibilityLabel?: string;
  loadingPlaceholder?: boolean;
};

export function NewsImage({ uri, style, accessibilityLabel, loadingPlaceholder = false }: NewsImageProps) {
  const { ui } = useLanguage();
  // Se recuerda qué URL falló: si cambia la URL, se vuelve a intentar.
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const failed = uri !== null && failedUri === uri;

  if (!uri || failed) {
    return (
      <View style={[style, styles.fallback]} accessibilityLabel={ui("Imagen no disponible")}>
        <Ionicons name="image-outline" size={30} color="#6F6F6F" />
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={[style, loadingPlaceholder && styles.loadingSurface]}
      contentFit="cover"
      cachePolicy="memory-disk"
      recyclingKey={uri}
      transition={160}
      accessibilityLabel={accessibilityLabel}
      onError={() => setFailedUri(uri)}
    />
  );
}

const styles = StyleSheet.create({
  loadingSurface: { backgroundColor: '#1A1A1A' },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
  },
});
