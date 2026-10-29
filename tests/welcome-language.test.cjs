const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
function runtime(){
 let cursor=0,effects=[];const slots=[];const same=(a,b)=>a&&b&&a.length===b.length&&a.every((x,i)=>x===b[i]);
 const react={createElement:(type,props,...children)=>({type,props:props||{},children}),Fragment:'fragment',
 createContext:()=>({Provider:'provider'}),useContext:()=>null,
 useState(initial){const i=cursor++;if(!(i in slots))slots[i]=typeof initial==='function'?initial():initial;return [slots[i],v=>{slots[i]=typeof v==='function'?v(slots[i]):v;}];},
 useRef(initial){const i=cursor++;return slots[i]??(slots[i]={current:initial});},useMemo:fn=>fn(),useCallback:fn=>fn,
 useEffect(fn,deps){const i=cursor++;if(!slots[i]||!same(slots[i].deps,deps)){const old=slots[i];effects.push(()=>{old?.cleanup?.();slots[i]={deps,cleanup:fn()};});}}};
 return {react,render(fn){cursor=0;effects=[];const tree=fn();effects.forEach(fn=>fn());return tree;}};
}
function load(file,deps,react){const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React}}).outputText,{React:react,module:m,exports:m.exports,require:n=>{if(!(n in deps))throw Error('Unexpected dependency '+n);return deps[n];}});return m.exports;}
const all=n=>Array.isArray(n)?n.flatMap(all):n&&typeof n==='object'?[n,...all(n.children||[])]:[];
const settle=()=>new Promise(r=>setImmediate(r));
function provider(storage,userState={user:null}){
 const r=runtime(),patches=[];let value;
 const api=load('src/context/LanguageContext.tsx',{react:r.react,'@react-native-async-storage/async-storage':storage,'./AuthContext':{useAuth:()=>({user:userState.user,updateProfile:async body=>{patches.push(body);userState.user={...userState.user,...body};}})},'../i18n/ui':{translateUi:(_lang,s)=>s,translateTag:(_lang,s)=>s}},r.react);
 const render=()=>{value=r.render(()=>api.LanguageProvider({children:null})).props.value;return value;};render();
 return {render,get value(){return value;},patches};
}
function picker(context){
 const r=runtime();const api=load('src/components/WelcomeLanguagePicker.tsx',{react:r.react,'@expo/vector-icons':{Ionicons:'icon'},'react-native':{ActivityIndicator:'busy',Modal:'modal',Pressable:'press',ScrollView:'scroll',View:'view',StyleSheet:{create:x=>x,absoluteFill:{},hairlineWidth:1}},'react-native-safe-area-context':{SafeAreaProvider:'safe-provider',SafeAreaView:'safe'},'../context/LanguageContext':{useLanguage:()=>context.value},'../i18n/ui':{LANGUAGE_NAMES:{es:'Español',en:'English',pt:'Português'}},'./typography':{Text:'text'}},r.react);
 return ()=>all(r.render(()=>api.WelcomeLanguagePicker()));
}
test('Guest chooses a language, sheet closes after saving, and the preference survives restarting the app',async()=>{
 const data=new Map(),writes=[];const storage={getItem:async k=>data.get(k)||null,setItem:async(k,v)=>{writes.push([k,v]);data.set(k,v);}};
 const context=provider(storage);await settle();context.render();const render=picker(context);
 let n=render();assert.equal(n.find(x=>x.type==='modal').props.visible,false);
 n.find(x=>x.props.accessibilityState?.expanded===false).props.onPress();n=render();
 assert.equal(n.find(x=>x.type==='modal').props.visible,true);
 assert.deepEqual(n.filter(x=>x.props.accessibilityRole==='radio').map(x=>x.props.accessibilityLabel),['Español','English','Português']);
 n.find(x=>x.props.accessibilityLabel==='English'&&x.props.accessibilityRole==='radio').props.onPress();await settle();context.render();n=render();
 assert.equal(context.value.language,'en');assert.equal(n.find(x=>x.type==='modal').props.visible,false);
 assert.equal(n.find(x=>x.props.accessibilityState?.expanded===false).props.accessibilityLabel,'App language: English');
 assert.equal(data.get('itc_language'),'en');assert.equal(context.patches.length,0,'guests never patch an account');
 const restarted=provider(storage);await settle();assert.equal(restarted.render().language,'en');
 await restarted.value.setLanguage('pt');assert.equal(restarted.render().language,'pt');assert.equal(data.get('itc_language'),'pt');
});
test('Storage failure leaves the menu open with an error and unchanged selection; hardware back can close it',async()=>{
 const context=provider({getItem:async()=>null,setItem:async()=>{throw Error('storage unavailable');}});await settle();context.render();const render=picker(context);
 let n=render();n.find(x=>x.props.accessibilityState?.expanded===false).props.onPress();n=render();
 n.find(x=>x.props.accessibilityLabel==='English'&&x.props.accessibilityRole==='radio').props.onPress();await settle();context.render();n=render();
 assert.equal(context.value.language,'es');assert.equal(n.find(x=>x.type==='modal').props.visible,true);assert.ok(n.some(x=>x.props.accessibilityRole==='alert'));
 assert.ok(n.filter(x=>x.props.accessibilityRole==='radio').every(x=>!x.props.disabled));
 n.find(x=>x.type==='modal').props.onRequestClose();assert.equal(render().find(x=>x.type==='modal').props.visible,false);
});
test('Existing accounts keep their stored language and only the language field is patched when changed',async()=>{
 const state={user:{id:42,language:'pt',name:'Member',home_area:'Brooklyn'}};
 const context=provider({getItem:async()=> 'en',setItem:async()=>{}},state);await settle();assert.equal(context.render().language,'pt');
 await context.value.setLanguage('en');assert.equal(context.render().language,'en');
 assert.equal(JSON.stringify(context.patches),JSON.stringify([{language:'en'}]));assert.equal(state.user.home_area,'Brooklyn');assert.equal(state.user.name,'Member');
});
test('Registration preselects the welcome language and submits that same language when creating an account',async()=>{
 const context=provider({getItem:async()=>null,setItem:async()=>{}});await settle();context.render();
 await context.value.setLanguage('en');context.render();
 const r=runtime();let submitted;
 const screen=load('src/app/register.tsx',{
  react:r.react,'../components/MarketingConsent':{MarketingConsent:'marketing'},'../components/typography':{Text:'text',TextInput:'input'},'@expo/vector-icons':{Ionicons:'icon'},
  'expo-router':{router:{back(){},dismissAll(){},replace(){}},useLocalSearchParams:()=>({email:'new@example.test'})},
  'react-native':{ActivityIndicator:'busy',Keyboard:{dismiss(){}},KeyboardAvoidingView:'keyboard',Platform:{OS:'ios'},Pressable:'press',ScrollView:'scroll',StyleSheet:{create:x=>x},TouchableOpacity:'press',View:'view'},
  'react-native-safe-area-context':{SafeAreaView:'safe'},'../context/AuthContext':{useAuth:()=>({signUp:async(...args)=>{submitted=args;}})},
  '../context/LanguageContext':{useLanguage:()=>context.value},
 },r.react).default;
 const render=()=>all(r.render(()=>screen()));let n=render();
 assert.equal(n.find(x=>x.props.accessibilityRole==='radio'&&x.props.accessibilityState?.selected).props.accessibilityLabel,'English');
 n.find(x=>x.type==='input'&&x.props.autoComplete==='name').props.onChangeText('New Member');
 n.find(x=>x.type==='input'&&x.props.secureTextEntry).props.onChangeText('test-password');
 n.find(x=>x.props.accessibilityRole==='checkbox').props.onPress();n=render();
 const text=n=>(n.children||[]).map(x=>typeof x==='string'?x:x&&typeof x==='object'?text(x):'').join('');
 await n.find(x=>x.type==='press'&&text(x)===context.value.t('register.submit')).props.onPress();
 assert.equal(submitted[3],'en');assert.equal(submitted[4],true);assert.equal(submitted[5],false);
});

test('Login headline uses the approved text without punctuation and translates to English and Portuguese',async()=>{
 const context=provider({getItem:async()=>null,setItem:async()=>{}});await settle();context.render();
 assert.equal(context.value.t('login.title'),'Tu próximo plan de NYC empieza aquí');
 for(const [language,title] of [['en','Your next NYC plan starts here'],['pt','Seu próximo passeio em NYC começa aqui']]){
  await context.value.setLanguage(language);context.render();assert.equal(context.value.t('login.title'),title);
 }
});
