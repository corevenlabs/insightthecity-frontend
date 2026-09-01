import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { StyleProp, StyleSheet, View, type ImageStyle } from 'react-native';

type NewsImageProps = {
  uri: string | null;
  style: StyleProp<ImageStyle>;
  accessibilityLabel?: string;
};

export function NewsImage({ uri, style, accessibilityLabel }: NewsImageProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [uri]);

  if (!uri || failed) {
    return (
      <View style={[style, styles.fallback]} accessibilityLabel="Imagen no disponible">
        <Ionicons name="image-outline" size={30} color="#6F6F6F" />
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={style}
      contentFit="cover"
      cachePolicy="memory-disk"
      recyclingKey={uri}
      transition={160}
      accessibilityLabel={accessibilityLabel}
      onError={() => setFailed(true)}
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
  },
});
