const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
function load(file,deps,extra={}){const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{module:m,exports:m.exports,require:n=>deps[n],...extra});return m.exports;}
const api=load('src/lib/benefitSchedule.ts',{});
const ui=load('src/i18n/ui.ts',{});
const now=Date.parse('2026-10-29T15:00:00Z'),start=now+86400000;
const item={id:'scheduled',benefitAction:'qr',couponActive:true,couponStartsAt:new Date(start).toISOString(),couponEndsAt:new Date(start+86400000).toISOString(),couponStatus:'paused'};
test('Dates block even a stale available status, manual pauses and expiration never become scheduled; external benefits are unchanged',()=>{
 assert.equal(api.benefitSchedule({...item,couponStatus:'available'},now).blocked,true);
 assert.equal(api.benefitSchedule(item,now).phase,'scheduled');
 assert.equal(api.benefitSchedule({...item,couponActive:false},now).phase,'paused');
 assert.equal(api.benefitSchedule({...item,couponEndsAt:new Date(now-1).toISOString()},now).phase,'expired');
 assert.equal(api.benefitSchedule({...item,benefitAction:'external'},now).phase,'none');
 assert.equal(api.benefitSchedule({...item,couponStartsAt:null},now).phase,'paused');
});
test('Crossing the start requires server confirmation; server clock avoids early unlock on a device set a day ahead',()=>{
 assert.equal(api.benefitSchedule(item,start).phase,'checking');
 assert.equal(api.benefitSchedule({...item,couponStatus:'available'},start).phase,'available');
 const received=now+86400000, synced={...item,couponServerTime:new Date(now).toISOString(),couponReceivedAt:received};
 assert.equal(api.benefitSchedule(synced,received).remainingMs,86400000);
 assert.equal(api.benefitSchedule(synced,received+60000).remainingMs,86340000);
 assert.equal(api.benefitSchedule(synced,received+86400000).phase,'checking');
});
test('Compact countdown is localized, rounds up remaining minutes and has no negative or fake zero countdown',()=>{
 for(const lang of ['es','en','pt']){
 const tr=s=>ui.translateUi(lang,s),formatted=api.formatBenefitCountdown(86400000+8*3600000+24*60000,tr);
 assert.equal(formatted,`01 ${tr('día')} · 08 h · 24 min`);
 assert.equal(api.formatBenefitCountdown(1,tr),`00 ${tr('días')} · 00 h · 01 min`);
 }
});
test('Timer refreshes at the boundary, retries while offline, refreshes on foreground and cleans timers on unmount',()=>{
 let time=now,cursor=0,effects=[],itemValue={...item,couponServerTime:new Date(now).toISOString(),couponReceivedAt:now},requests=0,foreground;
 const state=[],timers=new Map();let next=0;
 class Clock extends Date{static now(){return time;}}
 const react={useState(initial){const i=cursor++;if(!(i in state))state[i]=typeof initial==='function'?initial():initial;return [state[i],v=>{state[i]=v;}];},useEffect(fn,deps){const i=cursor++;if(!state[i]||!deps.every((v,j)=>v===state[i].deps[j])){const old=state[i];effects.push(()=>{old?.cleanup?.();state[i]={deps,cleanup:fn()};});}}};
 const hook=load('src/lib/benefitSchedule.ts',{react,'react-native':{AppState:{addEventListener:(_name,fn)=>{foreground=fn;return {remove(){foreground=null;}};}}}},{Date:Clock,setInterval:(fn,delay)=>{const id=++next;timers.set(id,{fn,delay});return id;},clearInterval:id=>timers.delete(id)});
 const refresh=()=>requests++,render=()=>{cursor=0;effects=[];const s=hook.useBenefitSchedule(itemValue,refresh);effects.forEach(fn=>fn());return s;};
 assert.equal(render().phase,'scheduled');assert.equal(requests,0);
 time=start;[...timers.values()].find(x=>x.delay===1000).fn();assert.equal(render().phase,'checking');assert.equal(requests,1);
 [...timers.values()].find(x=>x.delay===15000).fn();assert.equal(requests,2);assert.equal(render().blocked,true);
 foreground('active');assert.equal(requests,3);
 itemValue={...itemValue,couponStatus:'available',couponServerTime:new Date(start).toISOString(),couponReceivedAt:start};assert.equal(render().blocked,false);assert.ok(![...timers.values()].some(x=>x.delay===15000));
 state.filter(x=>x?.cleanup).forEach(x=>x.cleanup());assert.equal(timers.size,0);assert.equal(foreground,null);
});
