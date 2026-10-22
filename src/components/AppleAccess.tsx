import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, View } from 'react-native';
import { requireOptionalNativeModule } from 'expo-modules-core';
import { router } from 'expo-router';
import { Text } from './typography';
import { API_URL } from '../constants/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

// Old installed binaries must remain usable until the new native build is installed.
const Apple: typeof import('expo-apple-authentication') | null = Platform.OS === 'ios' && requireOptionalNativeModule('ExpoAppleAuthentication')
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  ? require('expo-apple-authentication') : null;
export default function AppleAccess({ link = false, onSuccess, buttonHeight = 56 }: { link?: boolean; onSuccess?: () => void; buttonHeight?: number }) {
  const { signInWithApple, token, biometricAvailable, enableBiometric } = useAuth();
  const { ui, language } = useLanguage();
  const [available,setAvailable] = useState(false);
  const [busy,setBusy] = useState(false);
  const [pending,setPending] = useState<Record<string,unknown> | null>(null);
  const [accepted,setAccepted] = useState(false);
  const [error,setError] = useState('');
  useEffect(() => { let active=true; void Apple?.isAvailableAsync().then(value => { if(active) setAvailable(value); }).catch(() => {}); return () => { active=false; }; }, []);
  if (Platform.OS !== 'ios') return null;
  if (!Apple || !available) return <Pressable disabled accessibilityRole="button" accessibilityState={{ disabled: true }} style={{ backgroundColor: '#fff', borderRadius: 14, height: buttonHeight, width: '100%', flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}><Ionicons name="logo-apple" size={24} color="#000" accessible={false} /><Text style={{ color: '#000', fontSize: 18 }}>{ui('Continuar con Apple')}</Text></Pressable>;
  const submit = async (body:Record<string,unknown>) => {
    if(link) {
      const response=await fetch(`${API_URL}/api/users/apple/link`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify(body)});
      const data=await response.json(); if(!response.ok) throw new Error(data.message || ui('No se pudo vincular Apple.'));
      Alert.alert(ui('Apple vinculado'),ui('Ya puedes iniciar sesión con Apple sin perder tus datos.'));
    } else {
      await signInWithApple(body);
      if(biometricAvailable) Alert.alert(ui('Acceso rápido'),ui('¿Quieres activar el acceso biométrico en este dispositivo?'),[{text:ui('Ahora no'),style:'cancel'},{text:ui('Activar'),onPress:()=>{void enableBiometric().catch(()=>{});}}]);
    }
    setPending(null); onSuccess?.();
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
      await submit({...body,acceptLegal:accepted});
    } catch(caught) {
      const e=caught as Error & {code?:string};
      if(e.code==='REGISTRATION_REQUIRED' && body) setPending(body);
      else if (!['ERR_REQUEST_CANCELED', 'ERR_REQUEST_CANCELLED', 'ERR_CANCELED', 'ERR_CANCELLED', '1001'].includes(String(e.code)) && e.message !== 'The user canceled the authorization attempt') setError(e.message || ui('No se pudo iniciar sesión.'));
    } finally { setBusy(false); }
  };
  return <View style={{gap:16}}>
    {link && <Text style={{color:"white"}}>{ui("Vincular Apple a mi cuenta")}</Text>}
    {pending ? <>
      <Text style={{color:'white'}}>{ui('Para crear tu cuenta, acepta los términos y la privacidad.')}</Text>
      <Pressable accessibilityRole="checkbox" accessibilityState={{checked:accepted}} onPress={()=>setAccepted(!accepted)} style={{minHeight:48,justifyContent:'center'}}><Text style={{color:'#FDDD56'}}>{accepted?'✓':'□'} {ui('Acepto los términos y la política de privacidad')}</Text></Pressable>
      <View style={{flexDirection:'row',gap:20}}><Pressable accessibilityRole="link" onPress={()=>router.push({pathname:'/legal',params:{slug:'terms'}} as never)}><Text style={{color:'#FDDD56'}}>{ui('Términos')}</Text></Pressable><Pressable accessibilityRole="link" onPress={()=>router.push({pathname:'/legal',params:{slug:'privacy'}} as never)}><Text style={{color:'#FDDD56'}}>{ui('Privacidad')}</Text></Pressable></View>
      <Pressable accessibilityRole="button" disabled={!accepted||busy} onPress={()=>void run()} style={{backgroundColor:'#FDDD56',padding:18,borderRadius:14,opacity:accepted?1:0.5}}><Text style={{textAlign:'center',color:'black'}}>{ui('Crear cuenta con Apple')}</Text></Pressable>
      <Pressable onPress={()=>{setPending(null);setAccepted(false);}}><Text style={{color:'white'}}>{ui('Cancelar')}</Text></Pressable>
    </> : busy ? <ActivityIndicator color="#FDDD56" /> : <Apple.AppleAuthenticationButton buttonType={Apple.AppleAuthenticationButtonType.CONTINUE} buttonStyle={Apple.AppleAuthenticationButtonStyle.WHITE} cornerRadius={14} style={{height:buttonHeight,width:'100%'}} onPress={()=>void run()} />}
    {!!error && <Text accessibilityRole="alert" style={{color:'#FF8080'}}>{error}</Text>}
  </View>;
}
