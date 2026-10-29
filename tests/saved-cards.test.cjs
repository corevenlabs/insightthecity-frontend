const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
function load(file,deps,React){const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React}}).outputText,{React,module:m,exports:m.exports,require:n=>{if(!(n in deps))throw Error(n);return deps[n];}});return m.exports;}
const all=n=>Array.isArray(n)?n.flatMap(all):n&&typeof n==='object'?[n,...all(n.children||[])]:[];
function setup(){
 let cursor=0,effects=[],language='es',items=[{key:'experience:place',id:'place',kind:'experience',title:'Old name',image:'old.jpg'}],fail=false;
 const state=[];const React={createElement:(type,props,...children)=>({type,props:props||{},children}),useState:v=>{const i=cursor++;if(!(i in state))state[i]=v;return[state[i],v=>state[i]=v];},useEffect:(fn,deps)=>{const i=cursor++;if(!state[i]||deps.some((d,j)=>state[i].deps[j]!==d)){state[i]?.cleanup?.();effects.push(()=>{state[i]={deps,cleanup:fn()};});}}};
 const content=lang=>({id:'place',title:'Nuyores',image:'new.jpg',images:['new.jpg','second.jpg'],cardDescription:lang==='en'?'Peruvian food':'Comida peruana',cardBenefit:'15% OFF',region:'NY',access:'premium'});
 const deps={react:React,'../../lib/experiences':{fetchExperience:async(_id,lang)=>{if(fail)throw Error('offline');return content(lang);}},'../../lib/news':{fetchArticle:async()=>({id:9,title:'A plan',image:'plan.jpg',excerpt:'A short preview',date:'2026-10-29',link:''}),formatDate:x=>x},'../../constants/experiences':{},'../../context/SavedContext':{useSaved:()=>({items,ready:true})},'../../context/LanguageContext':{useLanguage:()=>({language,ui:s=>s})},'expo-router':{router:{push(){}}},'react-native':{useWindowDimensions:()=>({fontScale:1}),ActivityIndicator:'busy',ScrollView:'scroll',StyleSheet:{create:x=>x,absoluteFill:{}},TouchableOpacity:'button',View:'view'},'react-native-safe-area-context':{SafeAreaView:'safe'},'@expo/vector-icons':{Ionicons:'icon'},'expo-linear-gradient':{LinearGradient:'gradient'}};
 for(const [path,name] of Object.entries({'../../components/ScreenBackButton':'ScreenBackButton','../../components/typography':'Text','../../components/AdaptiveGrid':'AdaptiveGrid','../../components/NewsImage':'NewsImage','../../components/BenefitPreview':'BenefitPreview','../../components/SaveButton':'SaveButton'}))deps[path]={[name]:name};
 const Screen=load('src/app/(tabs)/saved.tsx',deps,React).default;
 return {render(){cursor=0;effects=[];const tree=Screen();effects.forEach(f=>f());return all(tree);},language:l=>language=l,items:v=>items=v,offline:()=>fail=true,content};
}
const settle=()=>new Promise(r=>setImmediate(r));
test('Existing saved experiences hydrate into the shared full card and refresh when language changes',async()=>{
 const h=setup();h.render();await settle();let card=h.render().find(n=>n.type==='BenefitPreview');assert.equal(card.props.variant,'grid');assert.equal(card.props.experience.cardDescription,'Comida peruana');assert.equal(card.props.experience.cardBenefit,'15% OFF');assert.equal(card.props.experience.images.length,2);
 h.language('en');h.render();await settle();card=h.render().find(n=>n.type==='BenefitPreview');assert.equal(card.props.experience.cardDescription,'Peruvian food');
});
test('A saved snapshot preserves the complete card offline and old requests cannot leak into a changed saved list',async()=>{
 const h=setup();h.offline();const snapshot=h.content('es');h.items([{key:'experience:place',id:'place',kind:'experience',title:'Nuyores',image:'new.jpg',experience:snapshot}]);h.render();await settle();assert.equal(h.render().find(n=>n.type==='BenefitPreview').props.experience,snapshot);
 h.items([]);assert.ok(!h.render().some(n=>n.type==='BenefitPreview'));
});
test('Saved plans include their image, preview and date plus a remove bookmark',async()=>{
 const h=setup();h.items([{key:'plan:9',id:'9',kind:'plan',title:'Old plan',image:'old.jpg'}]);h.render();await settle();const nodes=h.render();assert.ok(nodes.some(n=>n.type==='Text'&&n.children.includes('A short preview')));assert.ok(nodes.some(n=>n.type==='Text'&&n.children.includes('2026-10-29')));assert.ok(nodes.some(n=>n.type==='SaveButton'&&n.props.item.key==='plan:9'));
});
test('Saving keeps a complete experience preview but does not persist full article HTML',()=>{
 const React={createContext:()=>({})};const m=load('src/context/SavedContext.tsx',{react:React,'@react-native-async-storage/async-storage':{},'../lib/accountLocalData':{},'react-native':{},'./LanguageContext':{},'./AuthContext':{}},React);
 const exp={id:'a',title:'A',image:'a.jpg',cardDescription:'Summary',cardBenefit:'15% OFF'};assert.deepEqual(m.savedExperience(exp).experience,exp);
 const plan=m.savedPlan({id:1,title:'Plan',excerpt:'Preview',image:'p.jpg',date:'2026-10-29',link:'url',contentHtml:'Long article'});assert.equal(plan.plan.excerpt,'Preview');assert.equal(plan.plan.contentHtml,undefined);
});
