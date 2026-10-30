import { SocialAccessSheet, SocialLegalConsent } from './SocialAccessSheet';
import { SocialAccessButton } from './SocialAccessButton';
import { useEffect, useState } from 'react';
import { Alert, Platform, View } from 'react-native';
import { requireOptionalNativeModule } from 'expo-modules-core';
import { Text } from './typography';
import { API_URL } from '../constants/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

// Old installed binaries must remain usable until the new native build is installed.
const Apple: typeof import('expo-apple-authentication') | null = Platform.OS === 'ios' && requireOptionalNativeModule('ExpoAppleAuthentication')
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  ? require('expo-apple-authentication') : null;
export default function AppleAccess({ link = false, onSuccess, buttonHeight = 56, compact = false }: { link?: boolean; onSuccess?: () => void; buttonHeight?: number; compact?: boolean }) {
  const { signInWithApple, token, biometricAvailable, enableBiometric } = useAuth();
  const { ui, language } = useLanguage();
  const [available,setAvailable] = useState(false);
  const [busy,setBusy] = useState(false);
  const [pending,setPending] = useState<Record<string,unknown> | null>(null);
  const [acceptedMarketing,setAcceptedMarketing] = useState(false);
  const [accepted,setAccepted] = useState(false);
  const [error,setError] = useState('');
  useEffect(() => { let active=true; void Apple?.isAvailableAsync().then(value => { if(active) setAvailable(value); }).catch(() => {}); return () => { active=false; }; }, []);
  if (Platform.OS !== 'ios') return null;
  if (!Apple || !available) return <View style={compact ? {flexGrow:1,flexBasis:0,minWidth:140} : undefined}><SocialAccessButton provider="apple" label={ui('Continuar con Apple')} height={buttonHeight} compact={compact} disabled /></View>;
  const submit = async (body:Record<string,unknown>) => {
    if(link) {
      const response=await fetch(`${API_URL}/api/users/apple/link`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify(body)});
      const data=await response.json(); if(!response.ok) throw new Error(data.message || ui('No se pudo vincular Apple.'));
      Alert.alert(ui('Apple vinculado'),ui('Ya puedes iniciar sesión con Apple sin perder tus datos.'));
    } else {
      await signInWithApple(body);
      if(biometricAvailable) Alert.alert(ui('Acceso rápido'),ui('¿Quieres activar el acceso biométrico en este dispositivo?'),[{text:ui('Ahora no'),style:'cancel'},{text:ui('Activar'),onPress:()=>{void enableBiometric().catch(()=>{});}}]);
    }
    setPending(null); setAccepted(false); setAcceptedMarketing(false); onSuccess?.();
  };
  const run = async () => {
    setBusy(true); setError('');
    let body=pending;
    try {
      if(!body) {
        const response=await fetch(`${API_URL}/api/users/apple/challenge`,{method:'POST'});
        const data=await response.json(); if(!response.ok || !data.nonce) throw new Error(ui('No se pudo conectar con el servidor.'));
        const credential=await Apple.signInAsync({requestedScopes:[Apple.AppleAuthenticationScope.FULL_NAME,Apple.AppleAuthenticationScope.EMAIL],nonce:data.nonce});
        if(!credential.identityToken) throw new Error(ui('Apple no proporcionó una credencial.'));
        body={authorizationCode:credential.authorizationCode,identityToken:credential.identityToken,nonce:data.nonce,name:[credential.fullName?.givenName,credential.fullName?.familyName].filter(Boolean).join(' '),language};
      }
      await submit({...body,language,acceptLegal:accepted,acceptMarketing:acceptedMarketing});
    } catch(caught) {
      const e=caught as Error & {code?:string};
      if(e.code==='REGISTRATION_REQUIRED' && body) setPending(body);
      else if (!['ERR_REQUEST_CANCELED', 'ERR_REQUEST_CANCELLED', 'ERR_CANCELED', 'ERR_CANCELLED', '1001'].includes(String(e.code)) && e.message !== 'The user canceled the authorization attempt') setError(e.message || ui('No se pudo iniciar sesión.'));
    } finally { setBusy(false); }
  };
  const cancel = () => { if(busy)return; setPending(null);setAccepted(false);setAcceptedMarketing(false);setError(''); };
  return <View style={[{gap:16}, compact && {flexGrow:1, flexBasis:0, minWidth:140}]}>
    {link && <Text style={{color:"white"}}>{ui("Vincular Apple a mi cuenta")}</Text>}
    <SocialAccessButton provider="apple" label={ui('Continuar con Apple')} height={buttonHeight} compact={compact} busy={busy} onPress={()=>void run()} />
    <SocialAccessSheet visible={pending !== null} title={ui('Continuar con Apple')} busy={busy} onClose={cancel}>
      <SocialLegalConsent accepted={accepted} onAccept={setAccepted} marketing={acceptedMarketing} onMarketing={setAcceptedMarketing} busy={busy} />
      {!!error && <Text accessibilityRole="alert" style={{color:'#FF8080'}}>{error}</Text>}
      <SocialAccessButton provider="apple" label={ui('Crear cuenta con Apple')} height={buttonHeight} busy={busy} disabled={!accepted} onPress={()=>void run()} />
    </SocialAccessSheet>
    {!!error && !pending && <Text accessibilityRole="alert" style={{color:'#FF8080'}}>{error}</Text>}
  </View>;
}
