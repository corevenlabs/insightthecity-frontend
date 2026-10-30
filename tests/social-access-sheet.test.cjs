const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
function runtime(){let cursor=0;const slots=[];const react={createElement:(type,props,...children)=>({type,props:props||{},children}),Fragment:'fragment',useState(initial){const i=cursor++;if(!(i in slots))slots[i]=initial;return[slots[i],v=>{slots[i]=typeof v==='function'?v(slots[i]):v;}];},useEffect(fn){fn();}};return{react,render(fn){cursor=0;return fn();}};}
function load(file,deps,react){const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React}}).outputText,{React:react,fetch:deps.fetch,module:m,exports:m.exports,require:n=>{if(!(n in deps))throw Error('Unexpected dependency '+n);return deps[n];}});return m.exports;}
const all=n=>Array.isArray(n)?n.flatMap(all):n&&typeof n==='object'?[n,...all(n.children||[])]:[];
const settle=()=>new Promise(r=>setImmediate(r));
test('new Google account opens a separate sheet; terms are required and marketing stays optional',async()=>{
 const r=runtime(),calls=[],google={GoogleSignin:{configure(){},async hasPlayServices(){},async signOut(){},async signIn(){return{type:'success',data:{idToken:'test-only-token'}};}},statusCodes:{SIGN_IN_CANCELLED:'cancel'}};
 let success=0;
 const auth={biometricAvailable:false,async signInWithGoogle(body){calls.push(body);if(calls.length===1)throw Object.assign(Error('new'),{code:'REGISTRATION_REQUIRED'});}};
 const Component=load('src/components/GoogleAccess.tsx',{'./SocialAccessSheet':{SocialAccessSheet:'sheet',SocialLegalConsent:'consent'},'./SocialAccessButton':{SocialAccessButton:'button'},react:r.react,'react-native':{Alert:{},Platform:{OS:'ios'},Pressable:'press',View:'view',TurboModuleRegistry:{get:()=>true}},'./typography':{Text:'text',TextInput:'input'},'../context/AuthContext':{useAuth:()=>auth},'../context/LanguageContext':{useLanguage:()=>({ui:s=>s,language:'es'})},'../constants/google':{},'@react-native-google-signin/google-signin':google},r.react).default;
 const render=()=>all(r.render(()=>Component({compact:true,onSuccess:()=>success++})));
 let nodes=render();const button=nodes.find(n=>n.type==='button');assert.equal(button.props.compact,true);
 button.props.onPress();await settle();nodes=render();
 assert.equal(nodes.find(n=>n.type==='sheet').props.visible,true);
 const consent=nodes.find(n=>n.type==='consent');assert.equal(consent.props.accepted,false);assert.equal(consent.props.marketing,false);
 const confirm=nodes.filter(n=>n.type==='button')[1];assert.equal(confirm.props.disabled,true);assert.equal(confirm.props.compact,undefined);
 assert.equal(nodes[0].props.style[1].flexBasis,0);
 consent.props.onAccept(true);nodes=render();assert.equal(nodes.filter(n=>n.type==='button')[1].props.disabled,false);
 nodes.filter(n=>n.type==='button')[1].props.onPress();await settle();nodes=render();
 assert.equal(calls.length,2);assert.equal(calls[1].acceptLegal,true);assert.equal(calls[1].acceptMarketing,false);assert.equal(calls[1].identityToken,'test-only-token');assert.equal(success,1);
 assert.equal(nodes.find(n=>n.type==='sheet').props.visible,false);
});
test('sheet hides for legal navigation, restores on return, and cannot cancel while submitting',()=>{
 const r=runtime();let focused=true,closed=0;const pushes=[];
 const api=load('src/components/SocialAccessSheet.tsx',{react:r.react,'@expo/vector-icons':{Ionicons:'icon'},'expo-router':{router:{push:x=>pushes.push(x)},useIsFocused:()=>focused},'react-native':{KeyboardAvoidingView:'keyboard',Modal:'modal',Platform:{OS:'android'},Pressable:'press',ScrollView:'scroll',View:'view',StyleSheet:{create:x=>x}},'react-native-safe-area-context':{SafeAreaProvider:'provider',SafeAreaView:'safe'},'../context/LanguageContext':{useLanguage:()=>({ui:s=>s})},'./MarketingConsent':{MarketingConsent:'marketing'},'./typography':{Text:'text'}},r.react);
 const render=busy=>all(api.SocialAccessSheet({visible:true,title:'Google',busy,onClose:()=>closed++,children:null}));
 let nodes=render(false);assert.equal(nodes.find(n=>n.type==='modal').props.visible,true);
 focused=false;assert.equal(render(false).find(n=>n.type==='modal').props.visible,false);
 focused=true;assert.equal(render(false).find(n=>n.type==='modal').props.visible,true);
 render(true).find(n=>n.type==='modal').props.onRequestClose();assert.equal(closed,0);
 render(false).find(n=>n.type==='modal').props.onRequestClose();assert.equal(closed,1);
 const consent=all(api.SocialLegalConsent({accepted:false,onAccept(){},marketing:false,onMarketing(){},busy:false}));
 const links=consent.filter(n=>n.props.accessibilityRole==='link');links[0].props.onPress();assert.equal(pushes[0].params.slug,'terms');links[1].props.onPress();assert.equal(pushes[1].params.slug,'privacy');
 assert.equal(consent.find(n=>n.type==='marketing').props.checked,false);
});

test('new Apple account uses the same independent consent sheet without expanding its compact button',async()=>{
 const r=runtime();let calls=0,success=0;
 const apple={isAvailableAsync:async()=>true,AppleAuthenticationScope:{FULL_NAME:'name',EMAIL:'email'},signInAsync:async()=>({identityToken:'test-only-apple',authorizationCode:'code',fullName:{givenName:'Test'}})};
 const Component=load('src/components/AppleAccess.tsx',{'./SocialAccessSheet':{SocialAccessSheet:'sheet',SocialLegalConsent:'consent'},'./SocialAccessButton':{SocialAccessButton:'button'},react:r.react,'react-native':{Alert:{},Platform:{OS:'ios'},View:'view'},'expo-modules-core':{requireOptionalNativeModule:()=>({})},'./typography':{Text:'text'},'../constants/api':{API_URL:'https://example.test'},'../context/AuthContext':{useAuth:()=>({biometricAvailable:false,async signInWithApple(body){calls++;if(calls===1)throw Object.assign(Error('new'),{code:'REGISTRATION_REQUIRED'});assert.equal(body.acceptLegal,true);assert.equal(body.acceptMarketing,false);}})},'../context/LanguageContext':{useLanguage:()=>({ui:s=>s,language:'es'})},'expo-apple-authentication':apple,fetch:async()=>({ok:true,json:async()=>({nonce:'nonce'})})},r.react).default;
 const render=()=>all(r.render(()=>Component({compact:true,onSuccess:()=>success++})));
 render();await settle();let nodes=render();nodes.find(n=>n.type==='button').props.onPress();await settle();nodes=render();
 assert.equal(nodes.find(n=>n.type==='sheet').props.visible,true);assert.equal(nodes[0].props.style[1].flexBasis,0);
 assert.equal(nodes.filter(n=>n.type==='button')[1].props.disabled,true);
 nodes.find(n=>n.type==='consent').props.onAccept(true);nodes=render();assert.equal(nodes.filter(n=>n.type==='button')[1].props.disabled,false);
 nodes.filter(n=>n.type==='button')[1].props.onPress();await settle();nodes=render();assert.equal(success,1);assert.equal(nodes.find(n=>n.type==='sheet').props.visible,false);
});
