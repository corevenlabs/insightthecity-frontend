const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'),vm=require('node:vm'),ts=require('typescript');
function harness(file,params={},errorCode='ACCOUNT_NOT_FOUND',signUp=async()=>{},options={}) {
  const state=[];let cursor=0,pushed,replaced,dismissed=0;
  const React={createElement:(type,props,...children)=>({type,props:props||{},children}),Fragment:'fragment',
    useState(initial){const index=cursor++;if(!(index in state))state[index]=typeof initial==='function'?initial():initial;return [state[index],v=>{state[index]=typeof v==='function'?v(state[index]):v;}];},useRef:()=>({current:null}),useCallback:fn=>fn};
  const modules={react:React,'./unused':{},'../components/LoginHero':{LoginHero:'hero'},'../components/AuthSocialButtons':{AuthSocialButtons:'social'},'../components/WelcomeLanguagePicker':{WelcomeLanguagePicker:'language'},'../hooks/useResponsiveLayout':{useResponsiveLayout:()=>({height:844,width:390,fontScale:1,insets:{top:47,bottom:34,left:0,right:0}})},'expo-status-bar':{StatusBar:'status'},'expo-router':{router:{push:v=>{pushed=v;},back(){},replace:v=>{replaced=v;},dismissAll(){dismissed++;}},useLocalSearchParams:()=>params,useFocusEffect(){}},
    'react-native':{ActivityIndicator:'spinner',Alert:{alert(){}},Keyboard:{dismiss(){}},KeyboardAvoidingView:'keyboard',Platform:{OS:'ios'},Pressable:'button',ScrollView:'scroll',StyleSheet:{create:s=>s},TouchableOpacity:'button',View:'view'},
    '@expo/vector-icons':{Ionicons:'icon'},'react-native-safe-area-context':{SafeAreaView:'safe'},'../components/typography':{Text:'text',TextInput:'input'},'../components/MarketingConsent':{MarketingConsent:'marketing'},
    '../context/AuthContext':{useAuth:()=>({signUp,signIn:async()=>{throw Object.assign(Error('login failed'),{code:errorCode});},biometricAvailable:false,biometricEnabled:false,loading:false,...options.auth})},
    '../context/LanguageContext':{useLanguage:()=>({language:'es',t:s=>s,ui:(s,p)=>p?s.replace('{email}',p.email):s,setLanguage(){}})}};
  const mod={exports:{}};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React}}).outputText,{React,module:mod,exports:mod.exports,require:n=>modules[n]});
  return {render(){cursor=0;return mod.exports.default();},get pushed(){return pushed;},get replaced(){return replaced;},get dismissed(){return dismissed;}};
}
function all(node){if(Array.isArray(node))return node.flatMap(all);if(!node||typeof node!=='object')return [];return [node,...(node.children||[]).flatMap(all)];}
const text=node=>(node.children||[]).map(c=>typeof c==='string'?c:c&&typeof c==='object'?text(c):'').join('');
test('unknown email offers registration with that email only; editing the email clears the notice',async()=>{
  const h=harness('src/app/login.tsx');let nodes=all(h.render());
  nodes.find(n=>n.type==='input'&&n.props.autoComplete==='email').props.onChangeText('client@example.com');
  nodes.find(n=>n.type==='input'&&n.props.autoComplete==='current-password').props.onChangeText('never-forward-password');
  nodes=all(h.render());await nodes.find(n=>n.type==='button'&&text(n)==='login.submit').props.onPress();
  nodes=all(h.render());assert.ok(nodes.some(n=>n.type==='text'&&text(n)==='Este correo aún no tiene cuenta'));
  nodes.find(n=>n.type==='button'&&text(n)==='register.submit').props.onPress();
  assert.equal(h.pushed.pathname,'/register');assert.equal(h.pushed.params.email,'client@example.com');
  assert.equal(Object.keys(h.pushed.params).join(','),'email');
  nodes.find(n=>n.type==='input'&&n.props.autoComplete==='email').props.onChangeText('another@example.com');
  assert.ok(!all(h.render()).some(n=>n.type==='text'&&text(n)==='Este correo aún no tiene cuenta'));
});
test('registration prefills the email and leaves password empty',()=>{
  const h=harness('src/app/register.tsx',{email:'client@example.com'});const nodes=all(h.render());
  assert.equal(nodes.find(n=>n.type==='input'&&n.props.autoComplete==='email').props.value,'client@example.com');
  assert.equal(nodes.find(n=>n.type==='input'&&n.props.secureTextEntry).props.value,'');
});

test('Marketing consent is unchecked, separate from terms and never required to register',async()=>{
 for(const marketing of [false,true]){
  let args;
  const h=harness('src/app/register.tsx',{email:'client@example.test'},undefined,async(...v)=>{args=v;});
  let n=all(h.render());
  assert.equal(n.find(x=>x.type==='marketing').props.checked,false);
  n.find(x=>x.type==='input'&&x.props.autoComplete==='name').props.onChangeText('Client');
  n.find(x=>x.type==='input'&&x.props.secureTextEntry).props.onChangeText('test-password');
  n.find(x=>x.props.accessibilityRole==='checkbox').props.onPress();
  if(marketing)n.find(x=>x.type==='marketing').props.onChange(true);
  n=all(h.render());
  const submit=n.find(x=>x.type==='button'&&text(x)==='register.submit');
  assert.equal(Boolean(submit.props.disabled),false);
  await submit.props.onPress();
  assert.equal(args[4],true);assert.equal(args[5],marketing);
 }
});

test('Redesigned sign-in retains membership/benefits return destinations for password and social access',async()=>{
 for(const [returnTo,expected] of [['membership','/profile?membership=1'],['benefits','/club'],[undefined,'/home']]){
  const h=harness('src/app/login.tsx',{returnTo},undefined,undefined,{auth:{signIn:async()=>{}}});let n=all(h.render());
  n.find(x=>x.type==='input'&&x.props.autoComplete==='email').props.onChangeText('member@example.test');
  n.find(x=>x.type==='input'&&x.props.autoComplete==='current-password').props.onChangeText('test-password');n=all(h.render());
  await n.find(x=>x.type==='button'&&text(x)==='login.submit').props.onPress();assert.equal(h.replaced,expected);
  n.find(x=>x.type==='social').props.onSuccess();assert.equal(h.replaced,expected);
 }
});
test('Password visibility preserves the typed password; recovery and guest navigation remain available',()=>{
 const h=harness('src/app/login.tsx');let n=all(h.render());
 n.find(x=>x.type==='input'&&x.props.autoComplete==='current-password').props.onChangeText('private-password');
 n.find(x=>x.props.accessibilityLabel==='Mostrar contraseña').props.onPress();n=all(h.render());
 let password=n.find(x=>x.type==='input'&&x.props.autoComplete==='current-password');assert.equal(password.props.secureTextEntry,false);assert.equal(password.props.value,'private-password');
 n.find(x=>x.props.accessibilityLabel==='Ocultar contraseña').props.onPress();n=all(h.render());assert.equal(n.find(x=>x.type==='input'&&x.props.autoComplete==='current-password').props.secureTextEntry,true);
 n.find(x=>x.type==='input'&&x.props.autoComplete==='email').props.onChangeText('member@example.test');n=all(h.render());
 n.find(x=>x.type==='button'&&text(x)==='login.forgot').props.onPress();assert.equal(h.pushed.pathname,'/forgot-password');assert.equal(h.pushed.params.email,'member@example.test');
 n.find(x=>x.type==='button'&&text(x).includes('welcome.guest')).props.onPress();assert.equal(h.replaced,'/home');
});
