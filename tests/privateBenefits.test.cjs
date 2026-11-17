const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
function load(path,globals={},req=()=>{throw Error('Unexpected runtime import')}){const mod={exports:{}};const js=ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;vm.runInNewContext(`(function(require,module,exports){${js}\n})`,globals)(req,mod,mod.exports);return mod.exports;}
const P=load('src/lib/privateBenefits.ts');
const code='PRIVATE987';
test('only a premium session with the exact loaded scope retains private data; QR objects stay unchanged',()=>{
 const item={id:'venue',benefitAction:'external',privateBenefitRequired:true,privateBenefitCode:code,benefitUrl:'https://backend.example/grant',ticketUrl:'https://backend.example/tickets'};
 assert.equal(P.scopedBenefitExperience(item,'a','a',true),item);
 for(const [loaded,current,premium]of[['a','a',false],['a','b',true],['','a',true]]){
  const result=P.scopedBenefitExperience(item,loaded,current,premium);assert.equal(result.privateBenefitCode,null);assert.equal(result.benefitUrl,null);assert.equal(result.ticketUrl,null);
 }
 const qr={id:'qr',benefitAction:'qr'};assert.equal(P.scopedBenefitExperience(qr,'old','new',false),qr);
});
test('saved copies never persist code or signed access URLs, including legacy offline snapshots',()=>{
 for(const item of [
  {benefitAction:'external',privateBenefitRequired:true,privateBenefitCode:code,memberBenefit:'Special offer',memberBenefitDetails:'Use '+code,benefitUrl:'https://backend.example/?grant=SECRET'},
  {benefitAction:'external',memberBenefit:'COD: '+code,memberBenefitDetails:'Use '+code,description:'Offer '+code,benefitUrl:'https://partner.example/'+code},
 ]){
  const result=P.publicSavedExperience(item);assert.doesNotMatch(JSON.stringify(result),new RegExp(code+'|SECRET'));assert.equal(result.benefitUrl,null);assert.equal(result.privateBenefitRequired,true);assert.ok(!('privateBenefitCode'in result));
 }
 const qr={benefitAction:'qr',memberBenefit:'3x2'};assert.equal(P.publicSavedExperience(qr),qr);
});
test('experience detail sends the bearer only in headers; guests remain anonymous',async()=>{
 const requests=[];const E=load('src/lib/experiences.ts',{fetch:async(url,options)=>{requests.push({url,options});return{ok:true,json:async()=>({id:'venue'}),headers:{get:()=>null}};}},name=>{assert.equal(name,'../constants/api');return{API_URL:'https://backend.example'};});
 await E.fetchExperience('venue','es');assert.equal(requests[0].options.headers.Authorization,undefined);
 await E.fetchExperience('venue','pt','SESSION_SECRET');assert.equal(requests[1].options.headers.Authorization,'Bearer SESSION_SECRET');assert.doesNotMatch(requests[1].url,/SESSION_SECRET/);
 const controller=new AbortController();await E.fetchExperience('venue','en','SESSION_SECRET',controller.signal);assert.equal(requests[2].options.signal,controller.signal);
});
