const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
function setup(language='es',fail=false){
 let cursor=0,opened='',copied='';const state=[];
 const React={createElement:(type,props,...children)=>({type,props,children}),useState:initial=>{const i=cursor++;if(!(i in state))state[i]=initial;return[state[i],v=>state[i]=v];}};
 const modules={react:React,'@expo/vector-icons':{Ionicons:'icon'},'react-native':{Clipboard:{setString:v=>{copied=v;}},Linking:{openURL:async v=>{if(fail)throw Error('No mail app');opened=v;}},Platform:{OS:'ios'},Pressable:'button',ScrollView:'scroll',StyleSheet:{create:v=>v},View:'view'},'react-native-safe-area-context':{SafeAreaView:'safe'},'../components/ClubLogo':{ClubLogo:'logo'},'../components/ScreenBackButton':{ScreenBackButton:'back'},'../components/typography':{Text:'text'},'../context/LanguageContext':{useLanguage:()=>({language})}};
 const m={exports:{}};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/app/support.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React}}).outputText,{React,exports:m.exports,module:m,require:n=>modules[n],encodeURIComponent});
 const flatten=n=>n&&typeof n==='object'?[n,...n.children.flat(Infinity).flatMap(flatten)]:[];
 return {render(){cursor=0;return flatten(m.exports.default());},get opened(){return opened;},get copied(){return copied;}};
}
test('Support prepares an email to the real address in all languages without sending automatically',async()=>{
 for(const language of ['es','en','pt']){
  const h=setup(language),nodes=h.render();assert.ok(nodes.some(n=>n.type==='back'));assert.equal(h.opened,'');
  await nodes.filter(n=>n.type==='button')[0].props.onPress();
  const url=new URL(h.opened);assert.equal(url.protocol,'mailto:');assert.equal(url.pathname,'soporte@insightthecity.com');assert.ok(url.searchParams.get('subject').includes('ITC Club'));assert.ok(url.searchParams.get('body'));
 }
});
test('Support can copy the address without opening mail',async()=>{
 const h=setup();await h.render().filter(n=>n.type==='button')[1].props.onPress();assert.equal(h.copied,'soporte@insightthecity.com');assert.equal(h.opened,'');assert.ok(h.render().some(n=>n.type==='text'&&n.children.includes('Correo copiado')));
});
test('A missing email application leaves support visible and explains the alternative',async()=>{
 const h=setup('es',true);await h.render().filter(n=>n.type==='button')[0].props.onPress();const nodes=h.render();assert.ok(nodes.some(n=>n.props?.accessibilityRole==='alert'));assert.ok(nodes.some(n=>n.type==='back'));assert.equal(h.opened,'');
});
