const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
function load(file,deps,React){const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React}}).outputText,{React,module:m,exports:m.exports,require:n=>{if(!(n in deps))throw Error(n);return deps[n];},setTimeout,clearTimeout});return m.exports;}
function storage(os='ios'){
 const data=new Map(),writes=[];let release;
 const secure={WHEN_UNLOCKED_THIS_DEVICE_ONLY:6,getItemAsync:async k=>data.get(k)||null,setItemAsync:async(k,v,options)=>{writes.push({k,v,options});if(release)await new Promise(r=>{release=r;});data.set(k,v);},deleteItemAsync:async k=>{data.delete(k);}};
 const api=load('src/lib/rememberedLogin.ts',{'expo-secure-store':secure,'react-native':{Platform:{OS:os}}});
 return {api,data,writes,hold:()=>{release=true;},release:()=>release()};
}
test('Credentials use protected device-only storage and clear without touching other credentials',async()=>{
 const h=storage();h.data.set('itc_token','session');await h.api.saveRememberedLogin(' client@example.test ','password-test');
 assert.equal(h.writes[0].options.keychainAccessible,6);assert.equal(h.writes[0].k,'itc_remembered_login_v1');
 assert.equal((await h.api.readRememberedLogin()).email,'client@example.test');assert.equal((await h.api.readRememberedLogin()).password,'password-test');
 await h.api.clearRememberedLogin();assert.equal(await h.api.readRememberedLogin(),null);assert.equal(h.data.get('itc_token'),'session');
});
test('A pending credential write cannot restore credentials after the user clears them',async()=>{
 const h=storage();h.hold();const write=h.api.saveRememberedLogin('a@b.test','test');await new Promise(r=>setImmediate(r));const clear=h.api.clearRememberedLogin();h.release();await Promise.all([write,clear]);assert.equal(await h.api.readRememberedLogin(),null);
});
test('Malformed values are discarded and web never stores a password',async()=>{
 const h=storage();h.data.set('itc_remembered_login_v1','{"email":5}');assert.equal(await h.api.readRememberedLogin(),null);assert.equal(h.data.size,0);
 const web=storage('web');await web.api.saveRememberedLogin('a@b.test','test');assert.equal(web.writes.length,0);assert.equal(await web.api.readRememberedLogin(),null);
});
const all=n=>Array.isArray(n)?n.flatMap(all):n&&typeof n==='object'?[n,...all(n.children||[])]:[];
function login({saved=null,fail=false,delay=false}={}){
 let cursor=0,refCursor=0,focus=[],resolveRead;const states=[],refs=[],events=[];
 const React={createElement:(type,props,...children)=>({type,props:props||{},children}),useState:v=>{const i=cursor++;if(!(i in states))states[i]=v;return[states[i],v=>states[i]=v];},useRef:v=>{const i=refCursor++;return refs[i]??(refs[i]={current:v});},useCallback:f=>f};
 const deps={react:React,'../lib/rememberedLogin':{readRememberedLogin:async()=>delay?new Promise(r=>{resolveRead=r;}):saved,saveRememberedLogin:async(email,password)=>events.push(['save',email,password]),clearRememberedLogin:async()=>events.push(['clear'])},'expo-router':{router:{replace(){events.push(['navigate']);},dismissAll(){},push(){},back(){}},useFocusEffect:f=>focus.push(f),useLocalSearchParams:()=>({})},'../context/AuthContext':{useAuth:()=>({loading:false,biometricEnabled:false,biometricAvailable:false,signIn:async()=>{events.push(['authenticate']);if(fail)throw Object.assign(Error('invalid'),{code:'INVALID_PASSWORD'});}})},'../context/LanguageContext':{useLanguage:()=>({t:s=>s,ui:s=>s})},'../components/typography':{Text:'text',TextInput:'input'},'@expo/vector-icons':{Ionicons:'icon'},'react-native-safe-area-context':{SafeAreaView:'safe'},'react-native':{Keyboard:{dismiss(){}},Alert:{alert(){}},StyleSheet:{create:s=>s},Platform:{OS:'ios'},ActivityIndicator:'busy',KeyboardAvoidingView:'keyboard',Pressable:'button',ScrollView:'scroll',TouchableOpacity:'button',View:'view'}};
 const Screen=load('src/app/login.tsx',deps,React).default;
 const render=()=>{cursor=0;refCursor=0;focus=[];return all(Screen());};
 const input=(nodes,complete)=>nodes.find(n=>n.type==='input'&&n.props.autoComplete===complete);
 return {render,events,input,load:()=>focus[0](),resolve:v=>resolveRead(v),submit:async()=>{const n=render();await n.find(n=>n.type==='button'&&n.children.some(c=>c?.children?.includes('login.submit'))).props.onPress();}};
}
const settle=()=>new Promise(r=>setImmediate(r));
test('Saved fields load masked, forgotten-password stays one line, and late reads cannot overwrite typing',async()=>{
 const h=login({saved:{email:'saved@example.test',password:'secret'}});h.render();h.load();await settle();const n=h.render();assert.equal(h.input(n,'email').props.value,'saved@example.test');assert.equal(h.input(n,'current-password').props.secureTextEntry,true);assert.equal(n.find(x=>x.props.accessibilityRole==='checkbox').props.accessibilityState.checked,true);assert.equal(n.find(x=>x.type==='text'&&x.children.includes('login.forgot')).props.numberOfLines,1);
 const late=login({delay:true});let nodes=late.render();late.load();late.input(nodes,'email').props.onChangeText('typed@example.test');late.resolve({email:'old@example.test',password:'old'});await settle();assert.equal(late.input(late.render(),'email').props.value,'typed@example.test');
});
test('Only successful opt-in login stores credentials; unchecked login clears and failed login never saves',async()=>{
 for(const [remember,fail] of [[true,false],[false,false],[true,true]]){
  const h=login({fail});let n=h.render();h.input(n,'email').props.onChangeText('client@example.test');h.input(n,'current-password').props.onChangeText('secret');n=h.render();if(remember)await n.find(x=>x.props.accessibilityRole==='checkbox').props.onPress();await h.submit();
  assert.equal(h.events[0][0],'authenticate');assert.equal(h.events.some(x=>x[0]==='save'),remember&&!fail);assert.equal(h.events.some(x=>x[0]==='clear'),!remember&&!fail);
 }
});
test('Unchecking removes remembered details immediately without a login',async()=>{
 const h=login({saved:{email:'client@example.test',password:'secret'}});h.render();h.load();await settle();await h.render().find(x=>x.props.accessibilityRole==='checkbox').props.onPress();assert.deepEqual(h.events,[['clear']]);assert.equal(h.render().find(x=>x.props.accessibilityRole==='checkbox').props.accessibilityState.checked,false);
});
