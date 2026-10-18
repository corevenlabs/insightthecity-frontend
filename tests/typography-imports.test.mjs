import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);}
test('all owned text and inputs use the shared typography component; icons stay independent',()=>{
 for(const file of files('src').filter(f=>f.endsWith('.tsx')&&!f.includes('components/typography/'))){const source=fs.readFileSync(file,'utf8');for(const match of source.matchAll(/import\s*\{([^}]+)\}\s*from\s*['"]react-native['"]/g)){const names=match[1].split(',').map(s=>s.trim());assert.ok(!names.includes('Text')&&!names.includes('TextInput'),file+' must use shared text');}}
});
