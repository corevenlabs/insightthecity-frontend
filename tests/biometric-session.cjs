const {test}=require('node:test');
const assert=require('node:assert/strict');
const ts=require('typescript'),vm=require('node:vm'),fs=require('node:fs');
function setup(){
 const plain=new Map(),secure=new Map(),states=[],refs=[],effects=[];let index=0,ri=0,mounted=false,value,rejectPrompt=false,status=200;
 const storage={getItem:async k=>plain.get(k)||null,setItem:async(k,v)=>plain.set(k,v),removeItem:async k=>plain.delete(k),multiGet:async keys=>keys.map(k=>[k,plain.get(k)??null]),multiRemove:async keys=>keys.forEach(k=>plain.delete(k))};
 const protectedReads=[];
 const secureStore={getItemAsync:async(k,o)=>{if(k==='itc_biometric_token'){protectedReads.push(o);if(rejectPrompt)throw Error('cancelled');}return secure.get(k)||null;},setItemAsync:async(k,v,o)=>{if(k==='itc_biometric_token')assert.equal(o.requireAuthentication,true);secure.set(k,v);},deleteItemAsync:async k=>secure.delete(k),WHEN_UNLOCKED_THIS_DEVICE_ONLY:1};
 const react={createContext:()=>({Provider:'provider'}),useState:initial=>{let n=index++;if(!(n in states))states[n]=initial;return[states[n],v=>states[n]=v];},useRef:initial=>{let n=ri++;return refs[n]??(refs[n]={current:initial});},useCallback:f=>f,useMemo:f=>f(),useEffect:f=>{if(!mounted)effects.push(f);},createElement:(_type,props)=>{value=props.value;return null;}};
 const auth={hasHardwareAsync:async()=>true,isEnrolledAsync:async()=>true,supportedAuthenticationTypesAsync:async()=>[1],AuthenticationType:{FACIAL_RECOGNITION:1},authenticateAsync:async()=>({success:true})};
 const modules={'../lib/rememberedLogin':{clearRememberedLogin:async()=>{secure.delete('itc_remembered_login_v1');}},'../lib/homeEntrance':{clearHomeEntrance(){},queueHomeEntrance(){}},'react':react,'react-native':{Platform:{OS:'ios'},AppState:{addEventListener:()=>({remove(){}})}},'expo-secure-store':secureStore,'expo-local-authentication':auth,'@react-native-async-storage/async-storage':storage,'../constants/api':{API_URL:'https://example.test'},'../lib/accountLocalData':{resumeAccountLocalDeletion:async()=>{},deleteAccountLocalData:async()=>{}}};
 const module={exports:{}};
 const fetch=async(_url,options)=>({status:options?.method==='POST'?200:status,ok:options?.method==='POST'||status===200,json:async()=>({success:true,token:'valid-token',user:{id:42,email:'test@example.test'}})});
 vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/context/AuthContext.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React}}).outputText,{React:react,module,exports:module.exports,require:n=>{if(!(n in modules))throw Error(n);return modules[n];},fetch,Promise,Date,Error,console});
 function render(){index=0;ri=0;module.exports.AuthProvider({children:null});mounted=true;return value;}
 return {render,plain,secure,protectedReads,cancel:v=>rejectPrompt=v,status:v=>status=v,mount:async()=>{render();for(const f of effects)f();await new Promise(r=>setImmediate(r));return render();}};
}
test('logout removes active session, retains protected login, restores only after biometric and server validation',async()=>{
 const h=setup();let a=await h.mount();await a.signIn('a','b');a=h.render();await a.enableBiometric();a=h.render();await a.signOut();a=h.render();assert.equal(a.token,null);assert.equal(a.user,null);assert.equal(a.hasSignedOut,true);assert.equal(a.biometricEnabled,true);assert.equal(h.secure.has('itc_token'),false);assert.equal(h.secure.has('itc_biometric_token'),true);
 await a.unlockWithBiometrics();a=h.render();assert.equal(a.token,'valid-token');assert.equal(a.user.id,42);assert.equal(a.hasSignedOut,false);assert.equal(h.protectedReads.at(-1).requireAuthentication,true);
});
test('cancelling authentication leaves user signed out and enrollment available',async()=>{
 const h=setup();let a=await h.mount();await a.signIn('a','b');a=h.render();await a.enableBiometric();a=h.render();await a.signOut();a=h.render();h.cancel(true);await assert.rejects(a.unlockWithBiometrics());a=h.render();assert.equal(a.token,null);assert.equal(a.biometricEnabled,true);
});
test('revoked credential and forget remove the protected credential',async()=>{
 const h=setup();let a=await h.mount();await a.signIn('a','b');a=h.render();await a.enableBiometric();a=h.render();await a.signOut();a=h.render();h.status(401);await assert.rejects(a.unlockWithBiometrics(),/expiró/);a=h.render();assert.equal(a.biometricEnabled,false);assert.equal(h.secure.has('itc_biometric_token'),false);
 h.status(200);await a.signIn('a','b');a=h.render();await a.enableBiometric();a=h.render();await a.forgetBiometric();a=h.render();assert.equal(a.biometricEnabled,false);assert.equal(h.secure.has('itc_biometric_token'),false);
});
test('server failure cannot establish a signed-out session',async()=>{
 const h=setup();let a=await h.mount();await a.signIn('a','b');a=h.render();await a.enableBiometric();a=h.render();await a.signOut();a=h.render();h.status(500);await assert.rejects(a.unlockWithBiometrics());assert.equal(h.render().token,null);
});
test('restart after logout exposes biometric option without restoring the active session',async()=>{
 const h=setup();h.plain.set('itc_biometric_enabled','true');h.secure.set('itc_biometric_token','valid-token');const a=await h.mount();assert.equal(a.token,null);assert.equal(a.user,null);assert.equal(a.biometricEnabled,true);assert.equal(h.protectedReads.length,0);
});
test('password login with another account clears the previous biometric enrollment',async()=>{
 const h=setup();let a=await h.mount();await a.signIn('a','b');a=h.render();await a.enableBiometric();a=h.render();await a.signOut();a=h.render();await a.signIn('other','password');a=h.render();assert.equal(a.biometricEnabled,false);assert.equal(h.secure.has('itc_biometric_token'),false);
});
test('deleting the account also removes biometric access',async()=>{
 const h=setup();let a=await h.mount();await a.signIn('a','b');a=h.render();await a.enableBiometric();a=h.render();await a.deleteAccount('password');a=h.render();assert.equal(a.token,null);assert.equal(a.biometricEnabled,false);assert.equal(h.secure.has('itc_biometric_token'),false);
});

test('logout keeps opted-in login details, while forgetting or deleting the account removes them',async()=>{
 for(const action of ['forget','delete']){
  const h=setup();let a=await h.mount();await a.signIn('test@example.test','test');a=h.render();h.secure.set('itc_remembered_login_v1','protected test fixture');
  if(action==='forget'){await a.signOut();a=h.render();assert.equal(h.secure.has('itc_remembered_login_v1'),true);await a.forgetBiometric();}
  else await a.deleteAccount('test');
  assert.equal(h.secure.has('itc_remembered_login_v1'),false);
 }
});
