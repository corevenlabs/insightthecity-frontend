// Run against the local Expo web server. Every API call is isolated with test fixtures.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
fs.mkdirSync('/tmp/itc-language-qa', { recursive: true });
const url = process.env.ITC_TEST_URL || 'http://localhost:8083';
(async () => {
 const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless:true });
 try {
 const context=await browser.newContext({viewport:{width:375,height:812},reducedMotion:'reduce'});
 let user={id:900001,name:'Language Test',email:'language@example.test',language:'es',is_premium:false,home_area:'Brooklyn',interests:['Museos']};
 let failPatch=false;const patches=[];const errors=[];
 await context.addInitScript(u=>{
  if(!sessionStorage.getItem('itc_test_seeded')){
   localStorage.setItem('itc_token','test-only-token');localStorage.setItem('itc_user',JSON.stringify(u));
   localStorage.setItem('itc_language','es');sessionStorage.setItem('itc_test_seeded','1');
  }
 },user);
 const experience={id:'language-test',title:'Test venue',category:'Museos',tags:['Museos'],image:'',date:'Hoy',location:'Manhattan',region:'NY',access:'premium',description:'Editorial description',includes:['Editorial inclusion'],recommendation:'Editorial recommendation',memberBenefit:'Editorial benefit',memberBenefitDetails:'Editorial terms',showBenefitOnCard:true,cardBenefit:'Editorial offer'};
 await context.route('**/*',async route=>{
  const req=route.request();const u=new URL(req.url());
  if(u.hostname==='localhost'||u.hostname==='127.0.0.1')return route.continue();
  if(u.pathname==='/api/users/me'){
   if(req.method()==='PATCH'){
    const data=req.postDataJSON();patches.push(data);await new Promise(r=>setTimeout(r,200));
    if(failPatch)return route.fulfill({status:503,json:{success:false,message:'Servicio no disponible'}});
    user={...user,...data};
   }
   return route.fulfill({json:{success:true,user}});
  }
  if(u.pathname.startsWith('/api/experiences'))return route.fulfill({json:u.pathname==='/api/experiences'?[experience]:experience});
  if(u.pathname.startsWith('/api/news'))return route.fulfill({json:{success:true,items:[],total:0,totalPages:0}});
  if(u.pathname.startsWith('/api/partnerships'))return route.fulfill({json:{success:true,partnership:null}});
  if(u.pathname.startsWith('/api/chat'))return route.fulfill({json:{success:true,messages:[]}});
  return route.abort();
 });
 const page=await context.newPage();page.setDefaultTimeout(30000);page.on('pageerror',e=>errors.push(e.message));
 await page.goto(url+'/profile',{waitUntil:'domcontentloaded',timeout:120000});
 const languageButton=()=>page.getByRole('button',{name:/^(Idioma de la aplicación|App language|Idioma do aplicativo):/});
 await languageButton().waitFor({timeout:90000});
 await languageButton().click();await page.getByRole('radio',{name:'English',exact:true}).click();
 await page.getByText('My profile',{exact:true}).waitFor();
 assert.deepEqual(patches.at(-1),{language:'en'});assert.equal(user.home_area,'Brooklyn');assert.deepEqual(user.interests,['Museos']);
 assert.equal(await page.locator('body').innerText().then(t=>t.includes('Museums')),true);
 await page.screenshot({path:'/tmp/itc-language-qa/profile-en.png'});
 await page.reload({waitUntil:'domcontentloaded'});await page.getByText('My profile',{exact:true}).waitFor();
 assert.equal(await page.evaluate(()=>localStorage.getItem('itc_language')),'en');
 await languageButton().click();await page.getByRole('radio',{name:'English',exact:true}).waitFor();await page.screenshot({path:'/tmp/itc-language-qa/picker-en.png'});
 failPatch=true;await page.getByRole('radio',{name:'Português',exact:true}).click();
 await page.getByRole('alert').filter({hasText:'Could not change the language'}).waitFor();
 assert.equal(await page.getByRole('radio',{name:'English',exact:true}).isChecked(),true);
 assert.equal(user.language,'en');failPatch=false;
 await page.getByRole('radio',{name:'Português',exact:true}).click();await page.getByText('Meu perfil',{exact:true}).waitFor();
 await languageButton().click();await page.getByRole('radio',{name:'Español',exact:true}).click();await page.getByText('Mi perfil',{exact:true}).waitFor();
 await languageButton().click();await page.getByRole('radio',{name:'English',exact:true}).click();await page.getByText('My profile',{exact:true}).waitFor();
 await page.goto(url+'/explore',{waitUntil:'domcontentloaded'});await page.getByText('Test venue',{exact:true}).waitFor();
 await page.getByRole('button',{name:'Filter by tags',exact:true}).click();await page.getByRole('checkbox',{name:'Museums',exact:true}).click();
 await page.getByText('Show results (1)',{exact:true}).click();await page.getByText('Test venue',{exact:true}).click();
 await page.getByText('ITC CLUB BENEFIT',{exact:true}).waitFor();await page.getByRole('button',{name:'Description',exact:true}).click();
 await page.getByText('Editorial description',{exact:true}).waitFor();
 assert.equal(await page.getByText('Address',{exact:true}).count(),1);
 await page.screenshot({path:'/tmp/itc-language-qa/detail-en.png'});
 await page.goto(url+'/guides',{waitUntil:'domcontentloaded'});await page.getByPlaceholder('Search guides...').waitFor();
 await page.getByPlaceholder('Search guides...').fill('Broadway');await page.getByText('Broadway for beginners',{exact:true}).waitFor();
 assert.equal(await page.getByText("NYC's best rooftops",{exact:true}).count(),0);
 await page.goto(url+'/club',{waitUntil:'domcontentloaded'});await page.getByText('Savings and discounts',{exact:true}).waitFor();
 await page.goto(url+'/club-form',{waitUntil:'domcontentloaded'});await page.getByPlaceholder('Phone number').waitFor();await page.getByText('CONTINUE TO PAYMENT',{exact:true}).waitFor();
 await page.goto(url+'/home',{waitUntil:'domcontentloaded'});await page.getByText("Today's top picks",{exact:true}).first().waitFor();
 await page.getByText("Today's weather",{exact:true}).waitFor();
 await page.goto(url+'/profile',{waitUntil:'domcontentloaded'});await languageButton().waitFor();await languageButton().click();
 await page.setViewportSize({width:812,height:375});await page.screenshot({path:'/tmp/itc-language-qa/picker-landscape.png'});
 assert.equal(await page.getByRole('radio',{name:'English',exact:true}).isChecked(),true);
 // Guest preference persists locally and must not issue an account PATCH.
 await page.getByRole('button',{name:'Close',exact:true}).click();await page.getByText('Sign out',{exact:true}).click();
 await page.getByText('You are not signed in',{exact:true}).waitFor();const count=patches.length;
 await languageButton().click();await page.getByRole('radio',{name:'Português',exact:true}).click();
 await page.getByText('Você não iniciou sessão',{exact:true}).waitFor();assert.equal(patches.length,count);
 await page.reload({waitUntil:'domcontentloaded'});await page.getByText('Você não iniciou sessão',{exact:true}).waitFor();
 assert.deepEqual(errors,[]);
 console.log('PASS: account language PATCH only; ES/EN/PT; persistence; failure/retry; translated canonical filters; detail; guides; club; payment copy; home; responsive picker; guest preference; no page errors.');
 fs.writeFileSync('/tmp/itc-language-qa/results.json',JSON.stringify({passed:true,patches,errors},null,2));
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
