const {test}=require('node:test');
const assert=require('node:assert/strict');
const ts=require('typescript'),vm=require('node:vm'),fs=require('node:fs');
function setup(){
 const data=new Map([['itc:saved:42','private'],['itc:recent-searches:42','private'],['itc:saved:43','keep']]);
 let fail=false;
 const storage={getItem:async k=>data.get(k)||null,setItem:async(k,v)=>{data.set(k,v);},removeItem:async k=>data.delete(k),multiRemove:async keys=>{if(fail)throw Error('disk');keys.forEach(k=>data.delete(k));}};
 const module={exports:{}};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/accountLocalData.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{module,exports:module.exports,require:()=>storage,Set,Promise});
 return {data,api:module.exports,fail:value=>{fail=value;}};
}
test('deletion removes only that account and prevents queued late writes',async()=>{
 const {api,data}=setup();
 await Promise.all([api.saveAccountLocalItem('itc:saved:42','late'),api.deleteAccountLocalData(42),api.saveAccountLocalItem('itc:recent-searches:42','late')]);
 assert.equal(data.has('itc:saved:42'),false);assert.equal(data.has('itc:recent-searches:42'),false);assert.equal(data.get('itc:saved:43'),'keep');
});
test('failed device cleanup stays pending and resumes successfully',async()=>{
 const {api,data,fail}=setup();fail(true);
 await assert.rejects(api.deleteAccountLocalData(42));assert.equal(data.get('itc:pending-local-deletion'),'42');
 fail(false);await api.resumeAccountLocalDeletion();assert.equal(data.has('itc:saved:42'),false);assert.equal(data.has('itc:pending-local-deletion'),false);
});
