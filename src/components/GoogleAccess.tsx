import { MarketingConsent } from './MarketingConsent';
import { SocialAccessButton } from './SocialAccessButton';
import { useState } from 'react';
import { Alert, Platform, Pressable, TurboModuleRegistry, View } from 'react-native';
import { router } from 'expo-router';
import { Text, TextInput } from './typography';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { GOOGLE_WEB_CLIENT_ID, GOOGLE_IOS_CLIENT_ID } from '../constants/google';
const Google: typeof import('@react-native-google-signin/google-signin') | null = Platform.OS !== 'web' && TurboModuleRegistry.get('RNGoogleSignin')
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  ? require('@react-native-google-signin/google-signin') : null;
if (Google) Google.GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID, iosClientId: GOOGLE_IOS_CLIENT_ID, offlineAccess: false });
export default function GoogleAccess({onSuccess,buttonHeight=56,compact=false}:{onSuccess:()=>void;buttonHeight?:number;compact?:boolean}) {
  const {signInWithGoogle,biometricAvailable,enableBiometric}=useAuth();
  const {ui,language}=useLanguage();
  const [busy,setBusy]=useState(false);
  const [pending,setPending]=useState<string|null>(null);
  const [mode,setMode]=useState<'register'|'link'|null>(null);
  const [acceptedMarketing,setAcceptedMarketing] = useState(false);
  const [accepted,setAccepted]=useState(false);
  const [password,setPassword]=useState('');
  const [showPassword,setShowPassword]=useState(false);
  const [error,setError]=useState('');
  if(!Google) return compact ? <View style={{flexGrow:1,flexBasis:0,minWidth:140}}><SocialAccessButton provider="google" label={ui('Continuar con Google')} height={buttonHeight} compact disabled /></View> : null; // Never call an absent native module.
  const run=async()=>{
    if(busy)return;
    setBusy(true);setError('');
    let identityToken=pending;
    try {
      if(!identityToken){
        await Google.GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog:true});
        await Google.GoogleSignin.signOut(); // Let the user choose the intended Google account.
        const response=await Google.GoogleSignin.signIn();
        if(response.type!=='success')return;
        identityToken=response.data.idToken;
        if(!identityToken)throw new Error(ui('Google no proporcionó una credencial.'));
      }
      await signInWithGoogle({identityToken,language,acceptLegal:accepted,acceptMarketing:acceptedMarketing,password:mode==='link'?password:undefined});
      setPassword('');setPending(null);setMode(null);setAccepted(false);setAcceptedMarketing(false);
      if(biometricAvailable)Alert.alert(ui('Acceso rápido'),ui('¿Quieres activar el acceso biométrico en este dispositivo?'),[{text:ui('Ahora no'),style:'cancel'},{text:ui('Activar'),onPress:()=>{void enableBiometric().catch(()=>{});}}]);
      onSuccess();
    }catch(caught){
      const e=caught as Error & {code?:string};
      if(e.code==='REGISTRATION_REQUIRED'){setPending(identityToken);setMode('register');}
      else if(e.code==='LINK_REQUIRED'){setPending(identityToken);setMode('link');setError(ui('Confirma tu contraseña para vincular Google a tu cuenta existente.'));}
      else if(e.code!==Google.statusCodes.SIGN_IN_CANCELLED){setPending(null);setMode(null);setPassword('');setAccepted(false);setAcceptedMarketing(false);setError(ui('No se pudo iniciar sesión con Google. Inténtalo de nuevo.'));}
    }finally{setBusy(false);}
  };
  return <View style={[{gap:12},compact&&{flexGrow:1,flexBasis:mode ? '100%' : 0,minWidth:140}]}>
    {mode==='register'&&<>
      <Pressable accessibilityRole="checkbox" accessibilityState={{checked:accepted}} onPress={()=>setAccepted(!accepted)} style={{minHeight:48,justifyContent:'center'}}><Text style={{color:'#FDDD56'}}>{accepted?'✓':'□'} {ui('Acepto los términos y la política de privacidad')}</Text></Pressable>
      <View style={{flexDirection:'row',gap:20}}>{(['terms','privacy'] as const).map(slug=><Pressable key={slug} accessibilityRole="link" onPress={()=>router.push({pathname:'/legal',params:{slug}} as never)}><Text style={{color:'#FDDD56'}}>{ui(slug==='terms'?'Términos':'Privacidad')}</Text></Pressable>)}</View>
      <MarketingConsent checked={acceptedMarketing} onChange={setAcceptedMarketing} />
    </>}
    {mode==='link'&&<View style={{gap:8}}><Text style={{color:'#fff'}}>{ui('Contraseña')}</Text><TextInput secureTextEntry={!showPassword} autoCapitalize="none" autoCorrect={false} textContentType="password" accessibilityLabel={ui('Contraseña')} placeholder={ui('Contraseña')} placeholderTextColor="#999" value={password} onChangeText={setPassword} style={{backgroundColor:'#171717',color:'#fff',borderWidth:1,borderColor:'#555',borderRadius:14,padding:16}} /><Pressable accessibilityRole="button" onPress={()=>setShowPassword(!showPassword)} style={{minHeight:44,justifyContent:'center'}}><Text style={{color:'#FDDD56'}}>{ui(showPassword?'Ocultar contraseña':'Mostrar contraseña')}</Text></Pressable></View>}
    <SocialAccessButton provider="google" label={ui('Continuar con Google')} height={buttonHeight} compact={compact && !mode} busy={busy}
      disabled={(mode==='register'&&!accepted)||(mode==='link'&&!password)} onPress={()=>void run()} />
    {mode&&<Pressable accessibilityRole="button" onPress={()=>{setMode(null);setPending(null);setPassword('');setAccepted(false);setAcceptedMarketing(false);setError('');}} style={{minHeight:44,justifyContent:'center'}}><Text style={{color:'#fff',textAlign:'center'}}>{ui('Cancelar')}</Text></Pressable>}
    {!!error&&<Text accessibilityRole="alert" style={{color:'#FF8080'}}>{error}</Text>}
  </View>;
}
