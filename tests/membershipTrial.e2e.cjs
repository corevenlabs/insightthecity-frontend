// Local app + isolated API fixtures. Never creates or changes a real subscription.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});try{
const errors=[];
for(const state of ['trialing','active']){
 let user={id:990002,name:'Prueba',email:'trial@example.test',language:'es',is_active:true,is_premium:true,has_billing_account:true,subscription_status:state,subscription_current_period_end:'2026-11-17T18:00:00Z',subscription_cancel_at_period_end:false,subscription_amount_cents:499,subscription_currency:'usd',subscription_interval:'month'};
 const context=await browser.newContext({viewport:{width:390,height:844}});
 await context.addInitScript(u=>{localStorage.setItem('itc_token','isolated-test-token');localStorage.setItem('itc_user',JSON.stringify(u));localStorage.setItem('itc_language','es');},user);
 await context.route('**/*',async r=>{const url=new URL(r.request().url());
 if(url.pathname==='/api/users/me')return r.fulfill({json:{success:true,user}});
 if(url.pathname==='/api/payment/renewal'){user={...user,subscription_cancel_at_period_end:r.request().postDataJSON().cancelAtPeriodEnd};return r.fulfill({json:{success:true,user,changed:true,emailSent:true}});}
 if(url.pathname.startsWith('/api/'))return r.fulfill({json:[]});
 if(url.hostname==='localhost'&&url.port==='8099')return r.continue();return r.abort();});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto('http://localhost:8099/profile?membership=1',{waitUntil:'domcontentloaded',timeout:120000});
 await page.getByText(state==='trialing'?'Tu mes gratis está activo':'Tu membresía y sus beneficios',{exact:true}).last().waitFor({timeout:90000});
 if(state==='trialing'){
 await page.getByText('Primer cobro',{exact:true}).waitFor();await page.getByText('Finaliza el período gratuito',{exact:true}).waitFor();
 assert.match(await page.locator('body').innerText(),/4[.,]99/);
 await page.getByRole('button',{name:/Cancelar renovación$/}).click();
 await page.getByText(/Conservarás tus beneficios gratis hasta el/).waitFor();
 await page.getByRole('button',{name:'Confirmar cancelación',exact:true}).click();
 await page.getByText(/Tu renovación está cancelada. Puedes disfrutar tus beneficios gratis/).waitFor();
 await page.getByText('No se realizará el primer cobro',{exact:true}).waitFor();
 fs.mkdirSync('output/membership-trial',{recursive:true});await page.screenshot({path:'output/membership-trial/trial-canceled.png',fullPage:true});
 await page.getByRole('button',{name:/Reactivar renovación$/}).click();await page.getByText(/Al reactivar la renovación, el primer cobro será/).waitFor();
 await page.getByRole('button',{name:'Confirmar reactivación',exact:true}).click();await page.getByText(/Tu período gratuito termina el/).waitFor();
 await page.screenshot({path:'output/membership-trial/trial-active.png',fullPage:true});
 }else{assert.equal(await page.getByText('Tu mes gratis está activo',{exact:true}).count(),0);await page.getByText('Próxima renovación',{exact:true}).waitFor();}
 await context.close();
}
assert.deepEqual(errors,[]);console.log('Verified trial dates/price, cancellation with no first charge, reactivation, and paid-member regression.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
