const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), vm = require('node:vm'), ts = require('typescript');
const data = { exports: {} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/experienceSocialLinks.ts','utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText, {module:data,exports:data.exports,URL});
test('old experiences and invalid destinations produce no social controls', () => {
  assert.equal(data.exports.experienceSocialLinks({}).length, 0);
  assert.equal(data.exports.experienceSocialLinks({instagramUrl:'javascript:alert(1)',tiktokUrl:'https://tiktok.com.evil.test/@x',facebookUrl:'https://facebook.com/l.php?u=https://evil.test'}).length, 0);
});
test('one configured platform renders one accessible link and opens its exact destination', async () => {
  let opened;
  const React = {createElement:(type,props,...children)=>({type,props,children}),Fragment:'fragment'};
  const exportsModule = {exports:{}};
  const modules = {'@expo/vector-icons':{Ionicons:'icon'},'expo-web-browser':{openBrowserAsync:async url=>{opened=url;}},'react-native':{Alert:{alert(){}},Pressable:'pressable',View:'view',StyleSheet:{create:s=>s}},'./typography':{Text:'text'},'../context/LanguageContext':{useLanguage:()=>({ui:(s,p)=>p?s.replace('{network}',p.network):s})},'../lib/experienceSocialLinks':data.exports};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/components/ExperienceSocialLinks.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React}}).outputText,{React,module:exportsModule,exports:exportsModule.exports,require:n=>modules[n]});
  const render = exportsModule.exports.ExperienceSocialLinks;
  assert.equal(render({experience:{}}),null);
  const node=render({experience:{instagramUrl:'https://www.instagram.com/riseny/'}});
  const buttons=node.children[1].children[0];
  assert.equal(buttons.length,1);
  assert.equal(buttons[0].props.accessibilityRole,'link');
  assert.equal(buttons[0].props.accessibilityLabel,'Abrir perfil en Instagram');
  buttons[0].props.onPress();
  await Promise.resolve();
  assert.equal(opened,'https://www.instagram.com/riseny/');
});
