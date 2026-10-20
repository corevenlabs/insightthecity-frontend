const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const moduleData={exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/experienceLocation.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{module:moduleData,exports:moduleData.exports,URL,encodeURIComponent});
const {eventMapsUrl,validMapsUrl}=moduleData.exports;
test('short display never replaces full destination; regional addresses are URL encoded',()=>{
 const url=new URL(eventMapsUrl({region:'NJ',location:'100 Washington St, Hoboken',shortAddress:'100 Washington St'}));
 assert.equal(url.searchParams.get('query'),'100 Washington St, Hoboken, New Jersey, USA');
 assert.equal(url.searchParams.get('api'),'1');
 assert.equal(eventMapsUrl({region:'NY'}),null);
});
test('explicit Google Maps pin wins; invalid URL falls back to address',()=>{
 assert.equal(eventMapsUrl({location:'wrong',mapsUrl:'https://maps.app.goo.gl/example'}),'https://maps.app.goo.gl/example');
 assert.equal(validMapsUrl('https://maps.google.com.evil.test/'),null);
 assert.equal(validMapsUrl('javascript:alert(1)'),null);
 assert.match(eventMapsUrl({location:'45 E 42nd St',mapsUrl:'https://evil.test/'}),/^https:\/\/www.google.com\/maps\/search/);
});
test('map tap consumes the event and opens full destination rather than the event card',async()=>{
 let opened,stopped=false;
 const React={createElement:(type,props,...children)=>({type,props,children}),Fragment:'fragment'};
 const exportsModule={exports:{}};
 const modules={react:React,'@expo/vector-icons':{Ionicons:'icon'},'react-native':{Alert:{alert(){}},Linking:{openURL:async url=>opened=url},Pressable:'pressable',View:'view',StyleSheet:{create:s=>s}},'./typography':{Text:'text'},'../context/LanguageContext':{useLanguage:()=>({ui:s=>s})},'../lib/experienceLocation':moduleData.exports};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/components/ExperienceLocation.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React}}).outputText,{React,module:exportsModule,exports:exportsModule.exports,require:n=>modules[n]});
 const node=exportsModule.exports.ExperienceLocation({experience:{region:'NY',shortAddress:'45 E 42nd St',location:'45 E 42nd St, Manhattan'}});
 assert.equal(node.type,'pressable');node.props.onPress({stopPropagation:()=>stopped=true});await Promise.resolve();assert.equal(stopped,true);assert.match(decodeURIComponent(opened),/45 E 42nd St, Manhattan/);
 assert.equal(exportsModule.exports.ExperienceLocation({experience:{region:'NJ'}}).type,'view');
});
