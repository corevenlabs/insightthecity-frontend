// Local browser + simulated API only. No accounts or payments are created.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});try{
 for(const viewport of [{width:375,height:812},{width:812,height:375}]){
 const c=await b.newContext({viewport});await c.route('**/*',r=>{const u=new URL(r.request().url());if(u.pathname.startsWith('/api/'))return r.fulfill({json:[]});if(u.hostname==='localhost'&&u.port==='8099')return r.continue();return r.abort();});
 const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://localhost:8099/register',{waitUntil:'domcontentloaded',timeout:120000});await p.locator('input').first().waitFor({timeout:90000});await p.evaluate(()=>document.fonts.ready);
 const inputs=p.locator('input');assert.ok(await inputs.count()>=3);assert.match(await inputs.first().evaluate(e=>getComputedStyle(e).fontFamily),/Roboto_400Regular/);
 await inputs.nth(0).fill('Prueba');await inputs.nth(0).press('Enter');await p.waitForTimeout(150);assert.equal(await inputs.nth(1).evaluate(e=>e===document.activeElement),true,'forwarded input ref must retain next-field focus');
 const families=await p.locator('[dir="auto"]').evaluateAll(nodes=>[...new Set(nodes.filter(e=>e.textContent.trim()).map(e=>getComputedStyle(e).fontFamily))]);assert.ok(families.some(f=>f.includes('Roboto_')));assert.ok(!families.some(f=>f.includes('Spline')||f.includes('system-ui')),families.join(','));
 fs.mkdirSync('output/typography',{recursive:true});await p.screenshot({path:`output/typography/register-${viewport.width}.png`,fullPage:true});assert.deepEqual(errors,[]);await c.close();
 }
 console.log('Typography verified on small mobile and landscape; text/input families and next-field refs preserved.');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
