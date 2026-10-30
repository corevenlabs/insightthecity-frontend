const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const all=n=>Array.isArray(n)?n.flatMap(all):n&&typeof n==='object'?[n,...all(n.children||[])]:[];
function setup(photos=['first.jpg','second.jpg','third.jpg'],reduced=false){
 let cursor=0,focused=true,timerId=0,effects=[];const slots=[],intervals=new Map(),timeouts=new Map(),scrolls=[],listeners={};
 const same=(a,b)=>a&&b&&a.length===b.length&&a.every((v,i)=>v===b[i]);
 const React={createElement:(type,props,...children)=>{if(type==='list'&&props.ref)props.ref.current={scrollToOffset:p=>scrolls.push(p)};return{type,props:props||{},children};},useState:v=>{const i=cursor++;if(!(i in slots))slots[i]=typeof v==='function'?v():v;return[slots[i],v=>slots[i]=typeof v==='function'?v(slots[i]):v];},useRef:v=>{const i=cursor++;return slots[i]??(slots[i]={current:v});},useCallback:(fn,deps)=>{const i=cursor++;if(!slots[i]||!same(slots[i].deps,deps))slots[i]={deps,fn};return slots[i].fn;},useEffect:(fn,deps)=>{const i=cursor++;if(!slots[i]||!same(slots[i].deps,deps)){const old=slots[i];slots[i]={deps};effects.push(()=>{old?.cleanup?.();slots[i].cleanup=fn();});}}};
 const modules={react:React,'expo-router':{useFocusEffect:fn=>React.useEffect(()=>focused?fn():undefined,[fn,focused])},'@expo/vector-icons':{Ionicons:'icon'},'./typography':{Text:'text'},'../context/LanguageContext':{useLanguage:()=>({ui:s=>s})},'react-native':{FlatList:'list',Image:'image',Pressable:'button',View:'view',StyleSheet:{create:s=>s},AccessibilityInfo:{isReduceMotionEnabled:async()=>reduced,addEventListener:(name,fn)=>{listeners[name]=fn;return{remove(){delete listeners[name];}};}},AppState:{currentState:'active',addEventListener:(name,fn)=>{listeners[name]=fn;return{remove(){delete listeners[name];}};}}}};
 const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/components/PublicationGallery.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React}}).outputText,{React,module:m,exports:m.exports,require:n=>{if(!(n in modules))throw Error(n);return modules[n];},setInterval:(fn,ms)=>{const id=++timerId;intervals.set(id,{fn,ms});return id;},clearInterval:id=>intervals.delete(id),setTimeout:(fn,ms)=>{const id=++timerId;timeouts.set(id,{fn,ms});return id;},clearTimeout:id=>timeouts.delete(id)});
 const render=()=>{cursor=0;effects=[];const nodes=all(m.exports.PublicationGallery({photos,width:390,height:320}));effects.forEach(fn=>fn());return nodes;};
 return {render,scrolls,intervals,timeouts,tick(){for(const t of [...intervals.values()])t.fn();},finish(offset){render().find(n=>n.type==='list').props.onMomentumScrollEnd({nativeEvent:{contentOffset:{x:offset}}});},focus:v=>{focused=v;render();},app:state=>{listeners.change(state);render();},motion:value=>{listeners.reduceMotionChanged(value);render();},unmount(){slots.forEach(s=>s?.cleanup?.());}};
}
const settle=()=>new Promise(r=>setImmediate(r));
async function ready(h){h.render();await settle();return h.render();}
test('Auto gallery advances each 4.5s and wraps from the last photo to the first without reversing the list',async()=>{
 const h=setup();let nodes=await ready(h);const list=nodes.find(n=>n.type==='list');assert.deepEqual(Array.from(list.props.data),['third.jpg','first.jpg','second.jpg','third.jpg','first.jpg']);assert.equal(list.props.initialScrollIndex,1);assert.equal([...h.intervals.values()][0].ms,4500);
 for(const offset of [780,1170,1560]){h.tick();assert.equal(h.scrolls.at(-1).offset,offset);assert.equal(h.scrolls.at(-1).animated,true);h.finish(offset);}
 assert.equal(h.scrolls.at(-1).offset,390);assert.equal(h.scrolls.at(-1).animated,false);nodes=h.render();assert.ok(nodes.some(n=>n.type==='text'&&n.children.join('')==='1/3'));
});
test('Manual swipes wrap backwards too and autoplay waits while dragging',async()=>{
 const h=setup();const nodes=await ready(h);nodes.find(n=>n.type==='list').props.onScrollBeginDrag();h.tick();assert.equal(h.scrolls.length,0);h.finish(0);assert.equal(h.scrolls.at(-1).offset,1170);assert.equal(h.scrolls.at(-1).animated,false);h.tick();assert.equal(h.scrolls.at(-1).offset,1560);
});
test('Pause, reduce motion, background and navigation stop autoplay; resuming restarts it',async()=>{
 const h=setup();let nodes=await ready(h);nodes.find(n=>n.type==='button').props.onPress();nodes=h.render();assert.equal(h.intervals.size,0);nodes.find(n=>n.type==='button').props.onPress();h.render();assert.equal(h.intervals.size,1);
 h.focus(false);assert.equal(h.intervals.size,0);h.focus(true);assert.equal(h.intervals.size,1);h.app('background');assert.equal(h.intervals.size,0);h.app('active');assert.equal(h.intervals.size,1);h.motion(true);assert.equal(h.intervals.size,0);h.unmount();assert.equal(h.timeouts.size,0);
});
test('A single photo remains static; programmatic-scroll fallback closes the loop without a native momentum event',async()=>{
 const single=setup(['one.jpg']);const nodes=await ready(single);assert.equal(single.intervals.size,0);assert.equal(nodes.find(n=>n.type==='list').props.scrollEnabled,false);assert.ok(!nodes.some(n=>n.type==='button'));
 const h=setup(['a.jpg','b.jpg']);await ready(h);h.tick();for(const t of [...h.timeouts.values()])t.fn();h.tick();for(const t of [...h.timeouts.values()])t.fn();assert.equal(h.scrolls.at(-1).offset,390);assert.equal(h.scrolls.at(-1).animated,false);
});
