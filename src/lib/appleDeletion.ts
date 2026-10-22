import { Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo-modules-core';
import { API_URL } from '../constants/api';
const Apple: typeof import('expo-apple-authentication') | null = Platform.OS === 'ios' && requireOptionalNativeModule('ExpoAppleAuthentication')
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  ? require('expo-apple-authentication') : null;
export async function appleDeletionCredential() {
  if(!Apple || !await Apple.isAvailableAsync())throw new Error('La verificación con Apple no está disponible en este dispositivo.');
  const response=await fetch(`${API_URL}/api/users/apple/challenge`,{method:'POST'});
  const challenge=await response.json();
  if(!response.ok || !challenge.nonce)throw new Error('No se pudo conectar con el servidor.');
  const credential=await Apple.signInAsync({requestedScopes:[],nonce:challenge.nonce});
  if(!credential.identityToken)throw new Error('Apple no proporcionó una credencial.');
  return {apple:true as const,identityToken:credential.identityToken,nonce:challenge.nonce};
}
export function isAppleCancellation(error:unknown){
 const e=error as Error & {code?:string};
 return ['ERR_REQUEST_CANCELED','ERR_REQUEST_CANCELLED','ERR_CANCELED','ERR_CANCELLED','1001'].includes(String(e.code)) || e.message==='The user canceled the authorization attempt';
}
