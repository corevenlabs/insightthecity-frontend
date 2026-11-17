const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'), vm=require('node:vm'), ts=require('typescript');
function load(file, deps, React){const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React}}).outputText,{React,exports:m.exports,module:m,require:n=>{if(!(n in deps))throw Error('Missing '+n);return deps[n];},fetch:(...args)=>deps.fetch(...args),URL,URLSearchParams,Date,AbortController,setTimeout:deps.setTimeout||setTimeout,clearTimeout:deps.clearTimeout||clearTimeout,setInterval:()=>0,clearInterval:()=>{}});return m.exports;}
function nodes(n){return Array.isArray(n)?n.flatMap(nodes):n&&typeof n==='object'?[n,...nodes(n.children||[])]:[];}
function harness({summary=true,scheduleOverrides={},platform='ios',fetchDetail,openLink,premium=true,anonymous=false,linkTimers={},contentTimers={}}={}){
 let cursor=0,effects=[],lang='es',token='account-one',pendingTranslation,issues=0,reserved=false;
 const opened=[],routes=[];let detailRequests=0;const slots=[]; const same=(a,b)=>a&&b&&a.length===b.length&&a.every((v,i)=>v===b[i]);
 const React={createElement:(type,props,...children)=>({type,props:props||{},children}),useState(initial){const i=cursor++;if(!(i in slots))slots[i]=typeof initial==='function'?initial():initial;return [slots[i],v=>{slots[i]=typeof v==='function'?v(slots[i]):v;}];},useCallback:fn=>fn,useRef(initial){const i=cursor++;return slots[i]??(slots[i]={current:initial});},useEffect(fn,deps){const i=cursor++;if(!slots[i]||!same(slots[i].deps,deps)){const prev=slots[i];effects.push(()=>{prev?.cleanup?.();slots[i]={deps,cleanup:fn()};});}}};
 const item={id:'venue',title:'Venue',access:'premium',benefitAction:'qr',couponStatus:'available',image:'https://example.test/photo',includes:[],description:'Source',cardDescription:summary?'Cocina peruana de temporada, ideal para compartir.':undefined,recommendation:'Source',memberBenefit:'20% OFF',...scheduleOverrides};
 const deps={react:React,'../constants/api':{API_URL:'https://api.example.test'},fetch:async(url,options)=>{
  if(url.endsWith('/reservation'))return {ok:true,json:async()=>({reserved})};
  issues++;reserved=true;return {ok:true,json:async()=>({qrDataUrl:'data:image/png;base64,SAME',reference:'ITC-7',expiresAt:new Date(Date.now()+86400000).toISOString()})};
 }};
 const benefits=load('src/lib/benefits.ts',deps,React);
 Object.assign(deps,{
  '../components/PublicationGallery':{PublicationGallery:'gallery'},'../components/ExperienceSocialLinks':{ExperienceSocialLinks:'social'},'../components/ExperienceLocation':{ExperienceLocation:'location'},'../components/typography':{Text:'text'},'../lib/partnerDisclosure':{partnerDisclosure:()=>null},'../components/ClubLogo':{ClubLogo:'logo'},'../hooks/useResponsiveLayout':{useResponsiveLayout:()=>({width:390,height:844})},'../components/SaveButton':{SaveButton:'save'},'../context/SavedContext':{savedExperience:x=>x},'@/context/LanguageContext':{useLanguage:()=>({language:lang,ui:s=>s})},'@/components/ExperienceTags':{ExperienceTags:'tags'},'@/lib/experienceFilters':{getExperienceTags:()=>[]},'@/components/ExpandableContent':{ExpandableSection:'section',ExpandableText:'expand'},'@expo/vector-icons':{Ionicons:'icon'},'expo-router':{router:{push:path=>routes.push(path)},useLocalSearchParams:()=>({id:'venue'})},'expo-web-browser':{},'expo-linear-gradient':{LinearGradient:'gradient'},'react-native':{Linking:{openURL:url=>{opened.push(url);return openLink?openLink(url):Promise.resolve();}},Platform:{OS:platform},AppState:{addEventListener:()=>({remove(){}})},ActivityIndicator:'busy',FlatList:'list',Image:'image',Modal:'modal',ScrollView:'scroll',TouchableOpacity:'button',View:'view',StyleSheet:{create:x=>x}},'react-native-safe-area-context':{SafeAreaProvider:'safe-provider',SafeAreaView:'safe'},'../context/AuthContext':{useAuth:()=>({user:anonymous?null:{id:token,is_premium:premium},token:anonymous?null:token})},'../lib/experiences':{fetchExperience:async(id,language,auth,signal)=>fetchDetail?fetchDetail(item,++detailRequests,signal):language==='es'?item:new Promise(resolve=>{pendingTranslation=()=>resolve({...item,memberBenefit:'Localized',cardDescription:summary?(language==='en'?'Seasonal Peruvian food, perfect for sharing.':'Cozinha peruana sazonal, ideal para compartilhar.'):undefined,couponStatus:'sold_out'});})},'../lib/benefits':benefits,
 });
 deps['../lib/privateBenefits']=load('src/lib/privateBenefits.ts',{},React);
 deps['../lib/experienceLocation']=load('src/lib/experienceLocation.ts',{},React);
 deps['../lib/benefitSchedule']=load('src/lib/benefitSchedule.ts',deps,React);
 deps['../lib/openExperienceLink']=load('src/lib/openExperienceLink.ts',{...deps,...linkTimers},React);
 const screen=load('src/app/experience-detail.tsx',{...deps,...contentTimers},React).default;
 return {setPremium:value=>{premium=value;},setAnonymous:value=>{anonymous=value;},opened,routes,render(){cursor=0;effects=[];const result=screen();effects.forEach(fn=>fn());return nodes(result);},setLanguage:l=>{lang=l;},resolve:()=>pendingTranslation(),switchAccount:()=>{token='account-two';reserved=false;},get issues(){return issues;},setSchedule:p=>Object.assign(item,p),benefits};
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
 const photo=n.find(x=>x.type==='gallery');const before=photo.props.height;
 n.find(x=>x.type==='view'&&x.props.onLayout).props.onLayout({nativeEvent:{layout:{height:400}}});
 n=h.render();const after=n.find(x=>x.type==='gallery').props.height;
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

test('Detail shows a saved My Maps link without an address or registered branches; invalid links do not create an empty location section',async()=>{
 for (const mapsUrl of ['https://www.google.com/maps/d/u/0/viewer?mid=shared-map', 'javascript:alert(1)']) {
  const h=harness({scheduleOverrides:{location:null,shortAddress:null,locations:[],mapsUrl}});
  h.render();await settle();const n=h.render();
  assert.equal(n.some(x=>x.type==='location'), mapsUrl.startsWith('https:'));
 }
});

test('Every publication uses the looping gallery with its main and additional photos, including free publications',async()=>{
 for(const access of ['free','premium']){
  const h=harness({scheduleOverrides:{access,image:'main.jpg',images:['main.jpg','second.jpg','third.jpg']}});h.render();await settle();const gallery=h.render().find(n=>n.type==='gallery');assert.ok(gallery);assert.deepEqual(Array.from(gallery.props.photos),['main.jpg','second.jpg','third.jpg']);
 }
});

const externalOffer={benefitAction:'external',benefitUrl:'https://partner.example.test/grant',privateBenefitRequired:true,privateBenefitCode:'TEST-ONLY'};
const externalButton=nodes=>nodes.find(x=>x.type==='button'&&x.props.accessibilityHint==='Abre un sitio externo');
const linkAlerts=nodes=>nodes.filter(x=>x.props.accessibilityRole==='alert');
function pendingLink(){let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};}
function linkClock(){const timers=new Map();let id=0;return {setTimeout(fn){timers.set(++id,fn);return id;},clearTimeout(id){timers.delete(id);},expire(){for(const [id,fn] of timers){timers.delete(id);fn();}}};}
async function externalHarness(options={}){const h=harness({scheduleOverrides:externalOffer,...options});h.render();await settle();h.render();return h;}

test('iOS and Android external benefits use the phone browser, preserve the fresh signed URL and ignore rapid duplicate taps',async()=>{
 for(const platform of ['ios','android']){
  const fresh=pendingLink();let requests=0;
  const h=await externalHarness({platform,fetchDetail:(item,count)=>{requests=count;return count===1?item:fresh.promise;}});
  const button=externalButton(h.render());button.props.onPress();button.props.onPress();assert.equal(requests,2);
  assert.equal(externalButton(h.render()).props.disabled,true);
  fresh.resolve({...externalOffer,id:'venue',title:'Venue',access:'premium',includes:[],benefitUrl:'https://partner.example.test/fresh?grant=TEST'});
  await settle();assert.deepEqual(h.opened,['https://partner.example.test/fresh?grant=TEST']);
  assert.equal(externalButton(h.render()).props.disabled,false);assert.equal(linkAlerts(h.render()).length,0);
 }
});
test('A stalled verification times out, aborts, unlocks retry and a late response cannot open a browser',async()=>{
 const pending=pendingLink(),clock=linkClock();let signal;
 const h=await externalHarness({linkTimers:clock,fetchDetail:(item,count,s)=>{if(count===1)return item;signal=s;return pending.promise;}});
 externalButton(h.render()).props.onPress();await settle();clock.expire();await settle();
 assert.equal(signal.aborted,true);assert.equal(externalButton(h.render()).props.disabled,false);assert.equal(linkAlerts(h.render()).length,1);
 pending.resolve({...externalOffer});await settle();assert.equal(h.opened.length,0);
});
test('Native browser errors and stalled dispatches show feedback and allow retry for private and direct links',async()=>{
 for(const privateBenefitRequired of [true,false]){
  let calls=0;const clock=linkClock(),pending=pendingLink();
  const h=await externalHarness({scheduleOverrides:{...externalOffer,privateBenefitRequired},linkTimers:clock,openLink:()=>{calls++;if(calls===1)return Promise.reject(Error('native failure'));if(calls===2)return pending.promise;return Promise.resolve();}});
  externalButton(h.render()).props.onPress();await settle();assert.equal(linkAlerts(h.render()).length,1);assert.equal(externalButton(h.render()).props.disabled,false);
  externalButton(h.render()).props.onPress();await settle();assert.equal(externalButton(h.render()).props.disabled,true);clock.expire();await settle();
  assert.equal(externalButton(h.render()).props.disabled,false);assert.equal(linkAlerts(h.render()).length,1);
  pending.resolve();await settle();externalButton(h.render()).props.onPress();await settle();assert.equal(calls,3);assert.equal(linkAlerts(h.render()).length,0);
 }
});
test('Network rejection never opens a private link and the next tap can succeed',async()=>{
 const h=await externalHarness({fetchDetail:(item,count)=>count===2?Promise.reject(Error('offline')):item});
 externalButton(h.render()).props.onPress();await settle();assert.equal(h.opened.length,0);assert.equal(linkAlerts(h.render()).length,1);
 externalButton(h.render()).props.onPress();await settle();assert.equal(h.opened.length,1);assert.equal(linkAlerts(h.render()).length,0);
});
test('Membership failure, logout/account changes and nonmembers never open private destinations',async()=>{
 const invalid=await externalHarness({fetchDetail:(item,count)=>count===1?item:{...item,privateBenefitCode:null,benefitUrl:null}});
 externalButton(invalid.render()).props.onPress();await settle();assert.equal(invalid.opened.length,0);assert.equal(linkAlerts(invalid.render()).length,1);
 const pending=pendingLink(),h=await externalHarness({fetchDetail:(item,count)=>count===1?item:pending.promise});
 externalButton(h.render()).props.onPress();await settle();h.switchAccount();h.render();pending.resolve({...externalOffer});await settle();assert.equal(h.opened.length,0);
 for(const anonymous of [false,true]){const free=await externalHarness({premium:false,anonymous});externalButton(free.render()).props.onPress();await settle();assert.equal(free.opened.length,0);assert.deepEqual(free.routes,['/club-form']);}
});
test('Paid ticket links share browser recovery and unsafe URLs never reach the phone browser',async()=>{
 const h=await externalHarness({scheduleOverrides:{...externalOffer,privateBenefitRequired:false,isPaidEvent:true,ticketUrl:'https://tickets.example.test/show'},openLink:()=>Promise.reject(Error('native failure'))});
 externalButton(h.render()).props.onPress();await settle();assert.deepEqual(h.opened,['https://tickets.example.test/show']);assert.equal(linkAlerts(h.render()).length,1);
 for(const benefitUrl of ['javascript:alert(1)','https://user:password@example.test/']){
 const invalid=await externalHarness({scheduleOverrides:{...externalOffer,privateBenefitRequired:false,benefitUrl}});externalButton(invalid.render()).props.onPress();await settle();assert.equal(invalid.opened.length,0);assert.equal(linkAlerts(invalid.render()).length,1);
 }
});

for(const platform of ['ios','android']){
 test(platform+': normal to premium immediately enables the existing CTA while its private link loads',async()=>{
  const background=pendingLink();let full;
  const h=await externalHarness({platform,premium:false,fetchDetail:(item,count)=>{full=item;return count===1?{...item,privateBenefitCode:null,benefitUrl:null}:count===2?background.promise:item;}});
  assert.equal(externalButton(h.render()).props.accessibilityLabel,'Suscríbete para desbloquear');
  h.setPremium(true);h.render();let n=h.render();assert.equal(externalButton(n).props.disabled,false);assert.ok(externalButton(n).props.accessibilityLabel.startsWith('OBTENER BENEFICIO'));
  externalButton(n).props.onPress();await settle();assert.equal(h.opened.length,1);
  background.resolve({...full,privateBenefitCode:null,benefitUrl:null});await settle();
  n=h.render();assert.equal(externalButton(n).props.disabled,false);assert.ok(n.some(x=>x.type==='text'&&x.children.includes('TEST-ONLY')||x.type==='text'&&x.children.some(v=>typeof v==='string'&&v.includes('TEST-ONLY'))));
 });
 test(platform+': failed upgrade refresh retries automatically without opening the browser',async()=>{
  const clock=linkClock();let calls=0;
  const h=await externalHarness({platform,premium:false,contentTimers:clock,fetchDetail:(item,count)=>{calls=count;if(count===1)return {...item,privateBenefitCode:null,benefitUrl:null};if(count===2)throw Error('temporary network failure');return item;}});
  h.setPremium(true);h.render();await settle();assert.equal(calls,2);assert.equal(externalButton(h.render()).props.disabled,false);
  clock.expire();await settle();const n=h.render();assert.equal(calls,3);assert.equal(linkAlerts(n).length,0);assert.equal(h.opened.length,0);
  externalButton(n).props.onPress();await settle();assert.equal(h.opened.length,1);
 });
 test(platform+': repeated upgrade failures retain the same working retry CTA, without leaking a code',async()=>{
  const clock=linkClock();let failing=true;
  const h=await externalHarness({platform,premium:false,contentTimers:clock,fetchDetail:(item,count)=>{if(count===1)return {...item,privateBenefitCode:null,benefitUrl:null};if(failing)throw Error('offline');return item;}});
  h.setPremium(true);h.render();await settle();clock.expire();await settle();let n=h.render();assert.equal(externalButton(n).props.disabled,false);assert.equal(linkAlerts(n).length,1);
  externalButton(n).props.onPress();await settle();assert.equal(h.opened.length,0);assert.equal(externalButton(h.render()).props.disabled,false);
  failing=false;externalButton(h.render()).props.onPress();await settle();assert.equal(h.opened.length,1);assert.equal(linkAlerts(h.render()).length,0);
 });
 test(platform+': downgrade or logout while upgrade validation is pending cannot open private destinations',async()=>{
  for(const logout of [false,true]){
   const pending=pendingLink();const h=await externalHarness({platform,contentTimers:linkClock(),fetchDetail:(item,count)=>count===1?item:pending.promise});
   externalButton(h.render()).props.onPress();await settle();h.setPremium(false);if(logout)h.setAnonymous(true);h.render();
   pending.resolve({...externalOffer,id:'venue',title:'Venue',access:'premium',includes:[],image:'https://example.test/photo'});await settle();assert.equal(h.opened.length,0);assert.equal(externalButton(h.render()).props.accessibilityLabel,'Suscríbete para desbloquear');
  }
 });
}
