// Local Expo web only. API and editorial photos are isolated fixtures; no production requests.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 try{
 const errors=[],user={id:990001,name:'Prueba',email:'preview@example.test',language:'es',is_premium:false};
 const pick=(id,title,order,extra={})=>({id,title,sortOrder:order,category:'Museos',tags:['Museos'],image:'https://fixtures.invalid/'+id+'.jpg',description:'Descubre una experiencia especial en Nueva York.',section:'top_today',isFeatured:true,isPublished:true,region:'NY',access:'free',includes:[],recommendation:'',...extra});
 const rows=[pick('top-one','Atardecer de prueba',1),pick('top-two','Museo de prueba',2),pick('top-three','Paseo de prueba',3),pick('benefit','Beneficio de prueba',4,{access:'premium',section:'drops',isFeatured:false})];
 const photo=fs.readFileSync('../insightthecity-backend/public/email/new-york.jpg');
 async function setup(reducedMotion='no-preference',width=390,height=844){
 const context=await browser.newContext({viewport:{width,height},reducedMotion});
 await context.addInitScript(u=>{localStorage.setItem('itc_token','isolated-test-token');localStorage.setItem('itc_user',JSON.stringify(u));localStorage.setItem('itc_language','es');},user);
 await context.route('**/*',async route=>{
  const req=route.request(),url=new URL(req.url());
  if(url.hostname==='fixtures.invalid')return route.fulfill({body:photo,contentType:'image/jpeg'});
  if(url.pathname==='/api/users/me')return route.fulfill({json:{success:true,user}});
  if(url.pathname.startsWith('/api/experiences'))return route.fulfill({json:url.pathname==='/api/experiences'?rows:rows.find(r=>url.pathname.endsWith('/'+r.id))||rows[0]});
  if(url.pathname.startsWith('/api/guides'))return route.fulfill({json:[]});
  if(url.pathname.startsWith('/api/news'))return route.fulfill({json:{success:true,items:[],total:0,totalPages:0}});
  if(url.pathname.startsWith('/api/partnerships'))return route.fulfill({json:{success:true,partnership:null}});
  if(url.pathname.startsWith('/api/chat'))return route.fulfill({json:{success:true,messages:[]}});
  if(url.hostname==='localhost'&&url.port==='8099')return route.continue();
  return route.abort();
 });
 const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto('http://localhost:8099/home',{waitUntil:'domcontentloaded',timeout:120000});
 await p.getByRole('button',{name:'Top de hoy: Atardecer de prueba',exact:true}).waitFor({timeout:90000});return {p,context};
 }
 const {p,context}=await setup();
 const top=()=>p.getByRole('button',{name:/^Top de hoy:/});
 await p.getByRole('button',{name:'Top de hoy: Museo de prueba',exact:true}).waitFor({timeout:9000});
 assert.equal(await p.getByRole('button',{name:/Pausar cambio automático|Reanudar cambio automático/}).count(),0);
 const compact=await top().boundingBox();assert.ok(compact.height<=170,'Banner should be slim');
 await p.getByRole('button',{name:'Top de hoy: Paseo de prueba',exact:true}).waitFor({timeout:9000});
 const title=top().getByText('TOP DE HOY',{exact:true});const benefits=p.getByText('BENEFICIOS ITC',{exact:false}).first();
 const a=await title.boundingBox(),b=await benefits.boundingBox();assert.ok(a.y<b.y,'Top de hoy must precede benefits');
 fs.mkdirSync('output/top-today-preview',{recursive:true});await p.screenshot({path:'output/top-today-preview/home-mobile.png',fullPage:true});
 await top().click();await p.waitForURL(/experience-detail.*id=top-three/);assert.match(p.url(),/id=top-three/);
 await context.close();
 const reduced=await setup('reduce',375,812);await reduced.p.waitForTimeout(5600);assert.equal(await reduced.p.getByRole('button',{name:/^Top de hoy:/}).getAttribute('aria-label'),'Top de hoy: Atardecer de prueba');assert.equal(await reduced.p.getByRole('button',{name:'Pausar cambio automático',exact:true}).count(),0);await reduced.p.screenshot({path:'output/top-today-preview/home-reduced-motion.png',fullPage:true});await reduced.context.close();
 const landscape=await setup('reduce',812,375);const banner=await landscape.p.getByRole('button',{name:/^Top de hoy:/}).boundingBox();assert.ok(banner.width<=812&&banner.x>=0);await landscape.context.close();
 assert.deepEqual(errors,[]);console.log('Verified: 5-second rotation without play/pause buttons, slim height, direct destination, placement and reduced motion.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
