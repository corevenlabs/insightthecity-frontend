const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'), vm=require('node:vm'), ts=require('typescript');
function load(file, deps, React){const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React}}).outputText,{React,exports:m.exports,module:m,require:n=>{if(!(n in deps))throw Error('Missing '+n);return deps[n];},fetch:(...args)=>deps.fetch(...args),URLSearchParams,Date,setInterval:()=>0,clearInterval:()=>{}});return m.exports;}
function nodes(n){return Array.isArray(n)?n.flatMap(nodes):n&&typeof n==='object'?[n,...nodes(n.children||[])]:[];}
function harness({summary=true,scheduleOverrides={}}={}){
 let cursor=0,effects=[],lang='es',token='account-one',pendingTranslation,issues=0,reserved=false;
 const slots=[]; const same=(a,b)=>a&&b&&a.length===b.length&&a.every((v,i)=>v===b[i]);
 const React={createElement:(type,props,...children)=>({type,props:props||{},children}),useState(initial){const i=cursor++;if(!(i in slots))slots[i]=typeof initial==='function'?initial():initial;return [slots[i],v=>{slots[i]=typeof v==='function'?v(slots[i]):v;}];},useCallback:fn=>fn,useRef(initial){const i=cursor++;return slots[i]??(slots[i]={current:initial});},useEffect(fn,deps){const i=cursor++;if(!slots[i]||!same(slots[i].deps,deps)){const prev=slots[i];effects.push(()=>{prev?.cleanup?.();slots[i]={deps,cleanup:fn()};});}}};
 const item={id:'venue',title:'Venue',access:'premium',benefitAction:'qr',couponStatus:'available',image:'https://example.test/photo',includes:[],description:'Source',cardDescription:summary?'Cocina peruana de temporada, ideal para compartir.':undefined,recommendation:'Source',memberBenefit:'20% OFF',...scheduleOverrides};
 const deps={react:React,'../constants/api':{API_URL:'https://api.example.test'},fetch:async(url,options)=>{
  if(url.endsWith('/reservation'))return {ok:true,json:async()=>({reserved})};
  issues++;reserved=true;return {ok:true,json:async()=>({qrDataUrl:'data:image/png;base64,SAME',reference:'ITC-7',expiresAt:new Date(Date.now()+86400000).toISOString()})};
 }};
 const benefits=load('src/lib/benefits.ts',deps,React);
 Object.assign(deps,{
  '../components/ExperienceSocialLinks':{ExperienceSocialLinks:'social'},'../components/ExperienceLocation':{ExperienceLocation:'location'},'../components/typography':{Text:'text'},'../lib/partnerDisclosure':{partnerDisclosure:()=>null},'../components/ClubLogo':{ClubLogo:'logo'},'../hooks/useResponsiveLayout':{useResponsiveLayout:()=>({width:390,height:844})},'../components/SaveButton':{SaveButton:'save'},'../context/SavedContext':{savedExperience:x=>x},'@/context/LanguageContext':{useLanguage:()=>({language:lang,ui:s=>s})},'@/components/ExperienceTags':{ExperienceTags:'tags'},'@/lib/experienceFilters':{getExperienceTags:()=>[]},'@/components/ExpandableContent':{ExpandableSection:'section',ExpandableText:'expand'},'@expo/vector-icons':{Ionicons:'icon'},'expo-router':{router:{},useLocalSearchParams:()=>({id:'venue'})},'expo-web-browser':{},'expo-linear-gradient':{LinearGradient:'gradient'},'react-native':{AppState:{addEventListener:()=>({remove(){}})},ActivityIndicator:'busy',FlatList:'list',Image:'image',Modal:'modal',ScrollView:'scroll',TouchableOpacity:'button',View:'view',StyleSheet:{create:x=>x}},'react-native-safe-area-context':{SafeAreaView:'safe'},'../context/AuthContext':{useAuth:()=>({user:{id:token,is_premium:true},token})},'../lib/experiences':{fetchExperience:async(id,language)=>language==='es'?item:new Promise(resolve=>{pendingTranslation=()=>resolve({...item,memberBenefit:'Localized',cardDescription:summary?(language==='en'?'Seasonal Peruvian food, perfect for sharing.':'Cozinha peruana sazonal, ideal para compartilhar.'):undefined,couponStatus:'sold_out'});})},'../lib/benefits':benefits,
 });
 deps['../lib/benefitSchedule']=load('src/lib/benefitSchedule.ts',deps,React);
 const screen=load('src/app/experience-detail.tsx',deps,React).default;
 return {render(){cursor=0;effects=[];const result=screen();effects.forEach(fn=>fn());return nodes(result);},setLanguage:l=>{lang=l;},resolve:()=>pendingTranslation(),switchAccount:()=>{token='account-two';reserved=false;},get issues(){return issues;},setSchedule:p=>Object.assign(item,p),benefits};
}
const settle=()=>new Promise(resolve=>setImmediate(resolve));
test('An open QR survives ES → EN → PT and delayed translation; another account never sees it',async()=>{
 const h=harness();h.render();await settle();let n=h.render();
 await n.find(x=>x.type==='button'&&x.props.accessibilityHint==='Genera un código QR válido durante 24 horas').props.onPress();await settle();
 n=h.render();assert.equal(n.find(x=>x.type==='modal').props.visible,true);
 for(const locale of ['en','pt']){
  h.setLanguage(locale);n=h.render();assert.equal(n.find(x=>x.type==='modal').props.visible,true,'QR stays visible during translation');
  h.resolve();await settle();n=h.render();assert.equal(n.find(x=>x.type==='modal').props.visible,true);
  assert.equal(n.find(x=>x.type==='image'&&x.props.source?.uri?.startsWith('data:')).props.source.uri,'data:image/png;base64,SAME');
 }
 assert.equal(h.issues,1,'language never reissues or revokes the QR');
 h.switchAccount();n=h.render();assert.equal(n.find(x=>x.type==='modal').props.visible,false);
});
test('Only the owner of a reservation can reopen the final reserved coupon; paused stays blocked',()=>{
 const {benefits}=harness();
 assert.equal(benefits.qrUnavailable('sold_out',true),false);
 assert.equal(benefits.qrUnavailable('sold_out',false),true);
 assert.equal(benefits.qrUnavailable('paused',true),true);
 assert.equal(benefits.qrUnavailable('available',false),false);
});

test('The photo detail uses the existing card summary and follows the selected content language',async()=>{
 const h=harness();h.render();await settle();let n=h.render();
 const summary=nodes=>nodes.find(x=>x.type==='text'&&x.props.numberOfLines===2&&x.props.ellipsizeMode==='tail');
 assert.equal(summary(n).children.join(''),'Cocina peruana de temporada, ideal para compartir.');
 assert.ok(n.some(x=>x.type==='gradient'&&x.props.pointerEvents==='none'));
 for(const [language,expected] of [['en','Seasonal Peruvian food, perfect for sharing.'],['pt','Cozinha peruana sazonal, ideal para compartilhar.']]){
  h.setLanguage(language);h.render();h.resolve();await settle();n=h.render();assert.equal(summary(n).children.join(''),expected);
 }
});
test('Details without an existing card summary do not invent a preview; long text can grow the photo instead of covering controls',async()=>{
 const h=harness({summary:false});h.render();await settle();let n=h.render();
 assert.ok(!n.some(x=>x.type==='gradient'));
 assert.ok(!n.some(x=>x.type==='text'&&x.props.ellipsizeMode==='tail'&&x.props.numberOfLines===2));
 const photo=n.find(x=>x.type==='list');const before=photo.props.renderItem({item:'https://example.test/photo'}).props.style[1].height;
 n.find(x=>x.type==='view'&&x.props.onLayout).props.onLayout({nativeEvent:{layout:{height:400}}});
 n=h.render();const after=n.find(x=>x.type==='list').props.renderItem({item:'https://example.test/photo'}).props.style[1].height;
 assert.ok(after>=500);assert.ok(after>before);
});


test('Scheduled QR shows a small white countdown and disabled Coming soon, then requires confirmed availability',async()=>{
 const h=harness({scheduleOverrides:{couponActive:true,couponStatus:'paused',couponStartsAt:new Date(Date.now()+60000).toISOString()}});
 h.render();await settle();let n=h.render();
 const label=x=>(x.children||[]).filter(y=>typeof y==='string').join('');
 let cta=n.find(x=>x.type==='button'&&x.props.accessibilityLabel==='PRÓXIMAMENTE');assert.ok(cta);assert.equal(cta.props.disabled,true);
 assert.ok(n.some(x=>x.type==='text'&&label(x)==='Disponible en'));
 const count=n.find(x=>x.type==='text'&&label(x).includes(' min'));assert.equal(count.props.style.color,'#FFFFFF');assert.equal(count.props.style.fontSize,16);
 await cta.props.onPress();assert.equal(h.issues,0);
 h.setSchedule({couponStartsAt:new Date(Date.now()-1000).toISOString()});n=h.render();assert.ok(n.some(x=>label(x)==='Comprobando disponibilidad…'));assert.equal(n.find(x=>x.props.accessibilityLabel==='PRÓXIMAMENTE').props.disabled,true);
 h.setSchedule({couponStatus:'available'});n=h.render();cta=n.find(x=>x.type==='button'&&x.props.accessibilityHint==='Genera un código QR válido durante 24 horas');assert.equal(cta.props.disabled,false);
 await cta.props.onPress();await settle();assert.equal(h.issues,1);assert.equal(h.render().find(x=>x.type==='modal').props.visible,true);
 h.setSchedule({couponStartsAt:new Date(Date.now()+60000).toISOString(),couponStatus:'paused'});n=h.render();assert.equal(n.find(x=>x.type==='modal').props.visible,false,'previously opened QR is hidden after rescheduling');
});
test('Manual pauses and expired benefits remain disabled without a misleading launch countdown',async()=>{
 for(const config of [{couponActive:false,couponStartsAt:new Date(Date.now()+60000).toISOString()},{couponActive:true,couponEndsAt:new Date(Date.now()-1000).toISOString()}]){
 const h=harness({scheduleOverrides:{couponStatus:'paused',...config}});h.render();await settle();const n=h.render();
 assert.ok(!n.some(x=>x.type==='text'&&x.children?.includes('Disponible en')));
 const cta=n.find(x=>x.type==='button'&&x.props.accessibilityLabel==='NO DISPONIBLE');assert.equal(cta.props.disabled,true);await cta.props.onPress();assert.equal(h.issues,0);
 }
});
