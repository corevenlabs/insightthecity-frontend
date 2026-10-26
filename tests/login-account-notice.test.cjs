const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'),vm=require('node:vm'),ts=require('typescript');
function harness(file,params={},errorCode='ACCOUNT_NOT_FOUND') {
  const state=[];let cursor=0,pushed;
  const React={createElement:(type,props,...children)=>({type,props:props||{},children}),Fragment:'fragment',
    useState(initial){const index=cursor++;if(!(index in state))state[index]=typeof initial==='function'?initial():initial;return [state[index],v=>{state[index]=typeof v==='function'?v(state[index]):v;}];},useRef:()=>({current:null}),useCallback:fn=>fn};
  const modules={react:React,'./unused':{},'expo-router':{router:{push:v=>{pushed=v;},back(){},replace(){},dismissAll(){}},useLocalSearchParams:()=>params,useFocusEffect(){}},
    'react-native':{ActivityIndicator:'spinner',Alert:{alert(){}},Keyboard:{dismiss(){}},KeyboardAvoidingView:'keyboard',Platform:{OS:'ios'},Pressable:'button',ScrollView:'scroll',StyleSheet:{create:s=>s},TouchableOpacity:'button',View:'view'},
    '@expo/vector-icons':{Ionicons:'icon'},'react-native-safe-area-context':{SafeAreaView:'safe'},'../components/typography':{Text:'text',TextInput:'input'},
    '../context/AuthContext':{useAuth:()=>({signIn:async()=>{throw Object.assign(Error('login failed'),{code:errorCode});},biometricAvailable:false,biometricEnabled:false,loading:false})},
    '../context/LanguageContext':{useLanguage:()=>({language:'es',t:s=>s,ui:(s,p)=>p?s.replace('{email}',p.email):s,setLanguage(){}})}};
  const mod={exports:{}};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React}}).outputText,{React,module:mod,exports:mod.exports,require:n=>modules[n]});
  return {render(){cursor=0;return mod.exports.default();},get pushed(){return pushed;}};
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
