const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
function load(file,deps,React){const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React}}).outputText,{React,module:m,exports:m.exports,require:n=>{if(!(n in deps))throw Error('Unexpected '+n);return deps[n];}});return m.exports;}
const all=n=>Array.isArray(n)?n.flatMap(all):n&&typeof n==='object'?[n,...all(n.children||[])]:[];
const text=n=>(n.children||[]).map(x=>typeof x==='string'?x:x&&typeof x==='object'?text(x):'').join('');
function harness(){
 let cursor=0,language='es';const state=[];
 const React={createElement:(type,props,...children)=>({type,props:props||{},children}),useState(initial){const i=cursor++;if(!(i in state))state[i]=initial;return [state[i],value=>{state[i]=typeof value==='function'?value(state[i]):value;}];}};
 const dictionary=load('src/i18n/ui.ts',{},React);
 const ui=s=>dictionary.translateUi(language,s);
 const api=load('src/components/ExpandableContent.tsx',{react:React,'./typography':{Text:'text'},'@/context/LanguageContext':{useLanguage:()=>({ui})},'@expo/vector-icons':{Ionicons:'icon'},'react-native':{TouchableOpacity:'button',View:'view',StyleSheet:{create:s=>s,hairlineWidth:1/3}}},React);
 return {render(fn){cursor=0;return all(fn(api,React));},setLanguage:v=>{language=v;},ui};
}
test('Sections show an initial preview and reveal all original content with localized arrow-free controls',()=>{
 for(const language of ['es','en','pt']){
  const h=harness();h.setLanguage(language);
  const full='Texto original completo, con condiciones que deben mantenerse íntegramente.';
  const render=()=>h.render(({ExpandableSection},React)=>ExpandableSection({title:h.ui('Descripción'),preview:React.createElement('text',{},'Vista previa breve'),children:React.createElement('text',{},full)}));
  let n=render();assert.ok(n.some(x=>text(x)==='Vista previa breve'));assert.ok(!n.some(x=>text(x)===full));
  assert.ok(!n.some(x=>x.type==='icon'));
  let toggle=n.find(x=>x.type==='button');assert.equal(text(toggle),h.ui('Ver más'));assert.equal(toggle.props.accessibilityState.expanded,false);
  assert.equal(toggle.props.accessibilityLabel,`${h.ui('Ver más')}: ${h.ui('Descripción')}`);
  toggle.props.onPress();n=render();assert.ok(n.some(x=>text(x)===full));assert.ok(!n.some(x=>text(x)==='Vista previa breve'));
  toggle=n.find(x=>x.type==='button');assert.equal(text(toggle),h.ui('Ver menos'));assert.equal(toggle.props.accessibilityState.expanded,true);
  toggle.props.onPress();n=render();assert.ok(n.some(x=>text(x)==='Vista previa breve'));
 }
});
test('Description and includes expand independently; switching language retains expanded content',()=>{
 const h=harness();
 const render=()=>h.render(({ExpandableSection},React)=>React.createElement('view',{},
  ExpandableSection({title:h.ui('Descripción'),preview:'Descripción breve',children:'Descripción completa sin recortar'}),
  ExpandableSection({title:h.ui('Qué incluye'),preview:'Dos primeros elementos',children:'Lista completa con todos los elementos'})));
 let n=render();n.filter(x=>x.type==='button')[1].props.onPress();n=render();
 assert.equal(n.filter(x=>x.type==='button')[0].props.accessibilityState.expanded,false);
 assert.equal(n.filter(x=>x.type==='button')[1].props.accessibilityState.expanded,true);
 h.setLanguage('en');n=render();assert.equal(n.filter(x=>x.type==='button')[1].props.accessibilityState.expanded,true);
 assert.equal(text(n.filter(x=>x.type==='button')[1]),h.ui('Ver menos'));
});
test('Benefit text can remove its arrow while existing unrelated text previews keep their current presentation',()=>{
 for(const showChevron of [false,undefined]){
  const h=harness();const n=h.render(({ExpandableText})=>ExpandableText({text:'Condiciones originales completas',showChevron}));
  assert.equal(n.some(x=>x.type==='icon'),showChevron!==false);
  assert.equal(n.find(x=>x.type==='text').props.numberOfLines,2);
 }
});
