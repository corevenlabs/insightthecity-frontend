import { Platform, TurboModuleRegistry } from 'react-native';
import { GOOGLE_WEB_CLIENT_ID, GOOGLE_IOS_CLIENT_ID } from '../constants/google';
const Google: typeof import('@react-native-google-signin/google-signin') | null = Platform.OS !== 'web' && TurboModuleRegistry.get('RNGoogleSignin')
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  ? require('@react-native-google-signin/google-signin') : null;
export class GoogleDeletionCancelled extends Error {}
// Borrar la cuenta pide verificar de nuevo con Google, igual que con Apple: el servidor exige un token recién emitido.
export async function googleDeletionCredential() {
  if(!Google)throw new Error('La verificación con Google no está disponible en este dispositivo.');
  Google.GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID, iosClientId: GOOGLE_IOS_CLIENT_ID, offlineAccess: false });
  await Google.GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog:true});
  await Google.GoogleSignin.signOut(); // Forces a fresh token from the account the user picks.
  const response=await Google.GoogleSignin.signIn();
  if(response.type!=='success')throw new GoogleDeletionCancelled();
  if(!response.data.idToken)throw new Error('Google no proporcionó una credencial.');
  return {google:true as const,identityToken:response.data.idToken};
}
export function isGoogleCancellation(error:unknown){
  const e=error as Error & {code?:string};
  return error instanceof GoogleDeletionCancelled || (!!Google && e.code===Google.statusCodes.SIGN_IN_CANCELLED);
}
