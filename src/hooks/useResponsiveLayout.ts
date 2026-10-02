import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { layoutForWidth } from '../lib/responsive';
export function useResponsiveLayout() {
  const { width, height, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  return { ...layoutForWidth(width, fontScale, insets.left + insets.right), height, fontScale, insets };
}
