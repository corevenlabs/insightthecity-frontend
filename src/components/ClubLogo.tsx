import { Image, type ImageProps } from 'expo-image';

/** Shared interior brand mark; authentication keeps its existing identity. */
export function ClubLogo({ width = 96, style, header = false }: {
  width?: number;
  style?: ImageProps['style'];
  header?: boolean;
}) {
  return <Image
    source={require('../../assets/images/itc-club-brand.png')}
    style={[{ width, height: width * 2 / 3, flexShrink: 0 }, style]}
    contentFit="contain"
    accessible
    accessibilityLabel="ITC CLUB"
    accessibilityRole={header ? 'header' : 'image'}
  />;
}
