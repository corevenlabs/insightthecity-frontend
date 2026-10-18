import { createContext, forwardRef, useContext } from 'react';
import { StyleSheet, Text as NativeText, TextInput as NativeTextInput, type TextProps, type TextInputProps, type TextStyle } from 'react-native';

// Brand roles: condensed Black for banners; Roboto for all reading and UI.
// Explicit font files avoid platform-specific synthetic bold or system fallbacks.
const faces: Record<number, string> = { 400: 'Roboto_400Regular', 500: 'Roboto_500Medium', 600: 'Roboto_600SemiBold', 700: 'Roboto_700Bold', 800: 'Roboto_800ExtraBold', 900: 'Roboto_900Black' };
export type Text = NativeText;
export type TextInput = NativeTextInput;
type Role = 'body' | 'banner';
const Context = createContext<{ weight: number; italic: boolean; variant: Role }>({ weight: 400, italic: false, variant: 'body' });
function weightOf(value: TextStyle['fontWeight'], fallback = 400) {
  if (value == null) return fallback;
  if (value === 'bold') return 700;
  if (value === 'normal') return 400;
  return Math.max(400, Math.min(900, Math.round(Number(value) / 100) * 100));
}
function face(weight: number, italic: boolean, variant: Role) {
  if (variant === 'banner') return 'RobotoCondensed_900Black';
  if (italic) return weight >= 600 ? 'Roboto_700Bold_Italic' : 'Roboto_400Regular_Italic';
  return faces[weight] || faces[400];
}
export const Text = forwardRef<NativeText, TextProps & { variant?: Role }>(function BrandText({ style, variant, ...props }, ref) {
  const parent = useContext(Context);
  const flat = StyleSheet.flatten(style) || {};
  const weight = weightOf(flat.fontWeight, parent.weight);
  const italic = flat.fontStyle == null ? parent.italic : flat.fontStyle === 'italic';
  const role = variant || parent.variant;
  return <Context.Provider value={{ weight, italic, variant: role }}><NativeText {...props} ref={ref} style={[style, { fontFamily: face(weight, italic, role), fontWeight: 'normal', fontStyle: 'normal' }]} /></Context.Provider>;
});
export const TextInput = forwardRef<NativeTextInput, TextInputProps>(function BrandTextInput({ style, ...props }, ref) {
  const flat = StyleSheet.flatten(style) || {};
  return <NativeTextInput {...props} ref={ref} style={[style, { fontFamily: face(weightOf(flat.fontWeight), flat.fontStyle === 'italic', 'body'), fontWeight: 'normal', fontStyle: 'normal' }]} />;
});
