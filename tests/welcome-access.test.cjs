const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const all=n=>Array.isArray(n)?n.flatMap(all):n&&typeof n==='object'?[n,...all(n.children||[])]:[];
const text=n=>(n.children||[]).map(x=>typeof x==='string'?x:x&&typeof x==='object'?text(x):'').join('');
function harness(file,overrides={}){
 let cursor=0;const state=[],calls=[];
 const react={createElement:(type,props,...children)=>({type,props:props||{},children}),Fragment:'fragment',useState(v){const i=cursor++;if(!(i in state))state[i]=typeof v==='function'?v():v;return [state[i],v=>{state[i]=typeof v==='function'?v(state[i]):v;}];},useRef:v=>({current:v}),useEffect(){},useCallback:fn=>fn};
 const modules={react,'../components/WelcomeLanguagePicker':{WelcomeLanguagePicker:'language'},'../components/GoogleAccess':{default:'google',__esModule:true},'../components/AppleAccess':{default:'apple',__esModule:true},'../components/typography':{Text:'text'},'./typography':{Text:'text',TextInput:'input'},'./MarketingConsent':{MarketingConsent:'marketing'},'./SocialAccessButton':{SocialAccessButton:'social'},'../constants/google':{},'../hooks/useResponsiveLayout':{useResponsiveLayout:()=>({width:393,height:852,fontScale:1,insets:{top:59,bottom:34,left:0,right:0}})},'@expo/vector-icons':{Ionicons:'icon'},'expo-image':{Image:'image'},'expo-linear-gradient':{LinearGradient:'gradient'},'expo-status-bar':{StatusBar:'status'},expo:{requireOptionalNativeModule:n=>n==='ExpoVideo'?null:{}},'expo-router':{router:{push:v=>calls.push(['push',v]),replace:v=>calls.push(['replace',v])},Redirect:'redirect',useLocalSearchParams:()=>({})},'../context/LanguageContext':{useLanguage:()=>({ui:s=>s,t:s=>s})},'../context/AuthContext':{useAuth:()=>({loading:false,token:null})},'react-native':{Platform:{OS:'ios'},TurboModuleRegistry:{get:()=>true},AccessibilityInfo:{},Animated:{Value:class{interpolate(){return 1;}},View:'view'},Easing:{},Pressable:'button',ScrollView:'scroll',StyleSheet:{create:x=>x,hairlineWidth:1/3,absoluteFill:{}},TouchableOpacity:'button',View:'view',Alert:{alert(){}}},...overrides};
 const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React}}).outputText,{React:react,__DEV__:false,module:m,exports:m.exports,require:n=>{if(n.endsWith('.jpg'))return n;if(!(n in modules))throw Error('Unexpected '+n);return modules[n];}});
 return {calls,render(props={}){cursor=0;let tree=m.exports.default(props);if(typeof tree?.type==='function')tree=tree.type(tree.props);return all(tree);}};
}
test('Welcome retains existing login, registration, guest and legal destinations in all languages',()=>{
 const d={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/i18n/ui.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{module:d,exports:d.exports});
 for(const lang of ['es','en','pt']){
  const ui=s=>d.exports.translateUi(lang,s),h=harness('src/app/welcome.tsx',{'../context/LanguageContext':{useLanguage:()=>({ui,t:s=>s})}}),nodes=h.render();
  for(const [label,route] of [['Crear cuenta','/register'],['Iniciar sesión','/login']])nodes.find(n=>n.type==='button'&&text(n)===ui(label)).props.onPress();
  assert.equal(JSON.stringify(h.calls),JSON.stringify([['push','/register'],['push','/login']]));
  nodes.find(n=>n.type==='button'&&text(n)==='welcome.guest').props.onPress();assert.equal(h.calls[2][1],'/home');
  const links=nodes.filter(n=>n.props.accessibilityRole==='link');links.forEach(n=>n.props.onPress());assert.equal(h.calls[3][1].params.slug,'terms');assert.equal(h.calls[4][1].params.slug,'privacy');
  assert.ok(nodes.some(n=>text(n)===ui('NY en tus manos')));assert.ok(!nodes.some(n=>n.type==='input'));
  assert.ok(nodes.find(n=>n.type==='apple').props.compact);assert.ok(nodes.find(n=>n.type==='google').props.compact);
 }
});
test('Google registration expands out of the compact row and still requires terms, with marketing optional',async()=>{
 let submitted;
 const Google={GoogleSignin:{configure(){},hasPlayServices:async()=>{},signOut:async()=>{},signIn:async()=>({type:'success',data:{idToken:'test-identity'}})},statusCodes:{SIGN_IN_CANCELLED:'cancel'}};
 const h=harness('src/components/GoogleAccess.tsx',{'@react-native-google-signin/google-signin':Google,'../context/AuthContext':{useAuth:()=>({signInWithGoogle:async body=>{submitted=body;if(!body.acceptLegal)throw Object.assign(Error(),{code:'REGISTRATION_REQUIRED'});},biometricAvailable:false})}});
 let n=h.render({compact:true,inline:true,onSuccess(){}});assert.equal(n[0].props.style.width,'48.5%');n.find(n=>n.type==='social').props.onPress();await new Promise(r=>setImmediate(r));
 n=h.render({compact:true,inline:true,onSuccess(){}});assert.equal(n[0].props.style.width,'100%');assert.equal(n.find(n=>n.type==='social').props.disabled,true);assert.equal(n.find(n=>n.type==='marketing').props.checked,false);
 n.find(n=>n.props.accessibilityRole==='checkbox').props.onPress();n=h.render({compact:true,inline:true,onSuccess(){}});assert.equal(n.find(n=>n.type==='social').props.disabled,false);n.find(n=>n.type==='social').props.onPress();await new Promise(r=>setImmediate(r));assert.equal(submitted.acceptLegal,true);assert.equal(submitted.acceptMarketing,false);
});
