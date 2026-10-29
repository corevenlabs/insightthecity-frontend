const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
function load(file,deps,React){const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React}}).outputText,{React,module:m,exports:m.exports,require:n=>{if(!(n in deps))throw Error('Unexpected '+n);return deps[n];}});return m.exports;}
const all=n=>Array.isArray(n)?n.flatMap(all):n&&typeof n==='object'?[n,...all(n.children||[])]:[];
const text=n=>(n.children||[]).map(x=>typeof x==='string'?x:x&&typeof x==='object'?text(x):'').join('');
function hooks(){let cursor=0;const state=[];const React={createElement:(type,props,...children)=>({type,props:props||{},children}),Fragment:'fragment',useState(v){const i=cursor++;if(!(i in state))state[i]=typeof v==='function'?v():v;return [state[i],v=>{state[i]=typeof v==='function'?v(state[i]):v;}];},useEffect(){},useCallback:f=>f,useMemo:f=>f()};return {React,render:fn=>{cursor=0;return fn();}};}
const summaries={es:'Cocina peruana de temporada, ideal para compartir.',en:'Seasonal Peruvian cooking, ideal for sharing.',pt:'Cozinha peruana sazonal, ideal para compartilhar.'};
const item=lang=>({id:'nuyores',title:'Nuyores',image:'https://example.test/place.jpg',images:[],region:'NY',access:'premium',cardDescription:summaries[lang],cardBenefit:'15% OFF',description:'Full description and conditions must stay in the detail.',address:'Address only in detail'});
test('Home and benefit grid render the same localized photo overlay and navigate to the same publication',()=>{
 for(const lang of ['es','en','pt'])for(const fontScale of [1,2]){
  const h=hooks(),calls=[];
  const deps={react:h.React,'./typography':{Text:'text'},'../hooks/useResponsiveLayout':{useResponsiveLayout:()=>({fontScale,gridCardWidth:335})},'../context/SavedContext':{savedExperience:x=>({key:x.id})},'./SaveButton':{SaveButton:'save'},'@expo/vector-icons':{Ionicons:'icon'},'expo-linear-gradient':{LinearGradient:'gradient'},'expo-router':{router:{push:x=>calls.push(x)},useFocusEffect(){}},'react-native':{AccessibilityInfo:{},StyleSheet:{create:x=>x,hairlineWidth:1/3,absoluteFill:{}},TouchableOpacity:'button',View:'view'},'../context/LanguageContext':{useLanguage:()=>({ui:(s,p)=>p?s.replace('{title}',p.title):s})},'./NewsImage':{NewsImage:'photo'}};
  const {BenefitPreview}=load('src/components/BenefitPreview.tsx',deps,h.React);
  for(const props of [{width:335},{variant:'grid'}]){
   const tree=h.render(()=>BenefitPreview({experience:item(lang),...props})),n=all(tree);
   const overlay=n.find(x=>x.props.style?.position==='absolute'&&x.props.style?.bottom===38);
   assert.ok(overlay,'title and summary share the overlay inside the photo button');
   assert.ok(all(overlay).some(x=>x.type==='text'&&text(x)==='Nuyores'));
   assert.equal(all(overlay).find(x=>text(x)===summaries[lang]).props.numberOfLines,2);
   assert.ok(n.some(x=>x.type==='gradient'));assert.ok(!n.some(x=>text(x)===item(lang).address||text(x)===item(lang).description));
   n.find(x=>x.type==='button'&&x.props.accessibilityLabel==='Abrir Nuyores').props.onPress();assert.equal(calls.at(-1).pathname,'/experience-detail');assert.equal(calls.at(-1).params.id,'nuyores');
   assert.ok(n.find(x=>x.type==='button').props.style[1].minHeight>=230);if(fontScale>1)assert.ok(n.find(x=>x.type==='button').props.style[1].minHeight>230);
  }
 }
});
test('The actual member Benefits screen uses the shared overlay card and refreshes descriptions with language',async()=>{
 const h=hooks();let language='es',focus;const requests=[];
 const names={'../../components/ScreenBackButton':'ScreenBackButton','../../components/typography':'Text','../../components/ClubLogo':'ClubLogo','../../components/MemberBenefitBanner':'MemberBenefitBanner','../../components/MembershipPrice':'MembershipPrice','../../components/AdaptiveGrid':'AdaptiveGrid','../../components/BenefitPreview':'BenefitPreview','@/components/TagFilter':'TagFilter'};
 const deps={react:h.React,'@/lib/experienceFilters':{matchesExperienceTags:()=>true},'@expo/vector-icons':{Ionicons:'icon'},'expo-router':{useRouter:()=>({}),useFocusEffect:f=>{focus=f;}},'react-native':{ScrollView:'scroll',StyleSheet:{create:x=>x},TouchableOpacity:'button',View:'view'},'react-native-safe-area-context':{SafeAreaView:'safe'},'../../context/AuthContext':{useAuth:()=>({loading:false,user:{is_premium:true},refreshUser:async()=>{}})},'../../context/LanguageContext':{useLanguage:()=>({language,t:s=>s,ui:s=>s,tagLabel:s=>s})},'../../lib/experiences':{fetchExperiences:async(_filter,lang)=>{requests.push(lang);return [item(lang)];}},'../../lib/payments':{fetchPlan:async()=>null}};
 for(const [path,name] of Object.entries(names))deps[path]={[name]:name};
 const Screen=load('src/app/(tabs)/club.tsx',deps,h.React).default;
 for(const lang of ['es','en','pt']){
  language=lang;h.render(Screen);focus();await new Promise(r=>setImmediate(r));const n=all(h.render(Screen));
  const card=n.find(x=>x.type==='BenefitPreview');assert.ok(card,'member list renders shared Home card');assert.equal(card.props.variant,'grid');assert.equal(card.props.experience.cardDescription,summaries[lang]);assert.equal(requests.at(-1),lang);
 }
});
