const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const all=n=>Array.isArray(n)?n.flatMap(all):n&&typeof n==='object'?[n,...all(n.children||[])]:[];
function harness({os='ios',apple=true,google=true,width=390,fontScale=1}={}){
 const state=[];let cursor=0,success=0;
 const React={createElement:(type,props,...children)=>({type,props:props||{},children}),useState(initial){const i=cursor++;if(!(i in state))state[i]=initial;return [state[i],v=>{state[i]=v;}];}};
 const deps={react:React,expo:{requireOptionalNativeModule:()=>apple?{}:null},'react-native':{Platform:{OS:os},TurboModuleRegistry:{get:()=>google?{}:null},StyleSheet:{create:s=>s},View:'view'},'./AppleAccess':{__esModule:true,default:'apple'},'./GoogleAccess':{__esModule:true,default:'google'},'./typography':{Text:'text'},'../context/LanguageContext':{useLanguage:()=>({ui:s=>s})},'../hooks/useResponsiveLayout':{useResponsiveLayout:()=>({width,fontScale})}};
 const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/components/AuthSocialButtons.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React}}).outputText,{React,module:m,exports:m.exports,require:n=>deps[n]});
 return {render(){cursor=0;return all(m.exports.AuthSocialButtons({onSuccess:()=>{success++;}}));},get success(){return success;}};
}
test('Login shows available providers only; legacy binaries and web remain usable without social modules',()=>{
 assert.equal(harness({os:'web'}).render().length,0);
 assert.equal(harness({apple:false,google:false}).render().length,0);
 const android=harness({os:'android'}).render();assert.ok(android.some(x=>x.type==='google'));assert.ok(!android.some(x=>x.type==='apple'));
 const ios=harness().render();assert.ok(ios.some(x=>x.type==='google'));assert.ok(ios.some(x=>x.type==='apple'));
});
test('Provider terms/linking expands to full width without hiding its state; cancel restores both providers',()=>{
 const h=harness();let n=h.render();const google=n.find(x=>x.type==='google');assert.equal(google.props.compact,true);
 google.props.onExpandedChange(true);n=h.render();assert.ok(!n.some(x=>x.type==='apple'));assert.equal(n.find(x=>x.type==='google').props.compact,false);
 n.find(x=>x.type==='google').props.onExpandedChange(false);n=h.render();assert.ok(n.some(x=>x.type==='apple'));
 n.find(x=>x.type==='apple').props.onExpandedChange(true);n=h.render();assert.ok(!n.some(x=>x.type==='google'));assert.equal(n.find(x=>x.type==='apple').props.compact,false);
 n.find(x=>x.type==='apple').props.onSuccess();assert.equal(h.success,1);
});
