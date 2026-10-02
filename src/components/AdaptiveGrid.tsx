import { Children, isValidElement, type ReactNode } from 'react';
import { View } from 'react-native';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
export function AdaptiveGrid({ children }: { children: ReactNode }) {
  const { columns } = useResponsiveLayout();
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
    {Children.toArray(children).map((child, index) => <View key={isValidElement(child) ? child.key ?? index : index} style={{ width: columns === 3 ? '31.9%' : columns === 2 ? '48.5%' : '100%' }}>{child}</View>)}
  </View>;
}
