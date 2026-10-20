const {test}=require('node:test');
const assert=require('node:assert/strict');
const ts=require('typescript'),vm=require('node:vm'),fs=require('node:fs');
function setup({enabled=true,fail=false}={}){
 let focus,attempts=0,slot=0,refSlot=0;const states=[],refs=[],timers=[],routes=[];
 const react={useState:v=>{const i=slot++;if(!(i in states))states[i]=v;return[states[i],v=>states[i]=v];},useRef:v=>{const i=refSlot++;return refs[i]??(refs[i]={current:v});},useCallback:f=>f,createElement:(type,props,...children)=>({type,props,children})};
 const auth={loading:false,biometricEnabled:enabled,biometricAvailable:true,unlockWithBiometrics:async()=>{attempts++;if(fail)throw Error('cancel');}};
 const modules={'react':react,'react-native':{StyleSheet:{create:v=>v},Platform:{OS:'ios'}},'expo-router':{router:{dismissAll(){},replace:r=>routes.push(r)},useLocalSearchParams:()=>({}),useFocusEffect:f=>focus=f},'../context/AuthContext':{useAuth:()=>auth},'../context/LanguageContext':{useLanguage:()=>({t:s=>s,ui:s=>s})},'../components/typography':{},'@expo/vector-icons':{},'react-native-safe-area-context':{}};
 const module={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/app/login.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React}}).outputText,{React:react,module,exports:module.exports,require:n=>modules[n],setTimeout:f=>{timers.push(f);return timers.length;},clearTimeout:i=>timers[i-1]=null});
 const render=()=>{slot=0;refSlot=0;return module.exports.default();};
 return {render,focus:()=>focus(),flush:async()=>{for(const f of timers.splice(0))f?.();await new Promise(r=>setImmediate(r));},attempts:()=>attempts,routes};
}
test('opening login automatically authenticates once and redirects after success',async()=>{const h=setup();h.render();h.focus();await h.flush();assert.equal(h.attempts(),1);assert.deepEqual(h.routes,['/home']);h.render();h.focus();await h.flush();assert.equal(h.attempts(),1);});
test('cancelled biometric attempt keeps password form without repeated prompts',async()=>{const h=setup({fail:true});h.render();h.focus();await h.flush();h.render();h.focus();await h.flush();assert.equal(h.attempts(),1);assert.deepEqual(h.routes,[]);});
test('without enrollment no biometric prompt appears',async()=>{const h=setup({enabled:false});h.render();h.focus();await h.flush();assert.equal(h.attempts(),0);});
test('leaving before the transition completes cancels the automatic prompt',async()=>{const h=setup();h.render();const cleanup=h.focus();cleanup();await h.flush();assert.equal(h.attempts(),0);});
