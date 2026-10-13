const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const moduleUnderTest = {exports:{}};
const source=ts.transpileModule(fs.readFileSync('src/lib/newsImages.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
new Function('module','exports',source)(moduleUnderTest,moduleUnderTest.exports);
const {articleImagesScript}=moduleUnderTest.exports;
function element(attributes){return {attributes:{...attributes},getAttribute(key){return this.attributes[key]??null;},setAttribute(key,value){this.attributes[key]=value;}};}
function run(images,sources=[]){vm.runInNewContext(articleImagesScript,{document:{querySelectorAll(selector){return selector.includes('picture source')?sources:images;}}});}
test('hydrates the actual WordPress transparent placeholder with real image and responsive variants',()=>{
 const image=element({src:'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP',width:'1500',height:'900','data-src':'https://insightthecity.com/wp-content/uploads/photo.jpg','data-srcset':'https://insightthecity.com/wp-content/uploads/photo-300.jpg 300w, https://insightthecity.com/wp-content/uploads/photo.jpg 1500w',loading:'lazy'});
 run([image]);assert.equal(image.attributes.src,image.attributes['data-src']);assert.equal(image.attributes.srcset,image.attributes['data-srcset']);assert.equal(image.attributes.loading,'eager');
});
test('supports alternate lazy-load plugins and picture sources while retaining ordinary images',()=>{
 const lazy=element({src:'placeholder.gif','data-lazy-src':'https://example.com/photo.jpg'});const ordinary=element({src:'https://example.com/ordinary.jpg',loading:'lazy'});const picture=element({'data-lazy-srcset':'https://example.com/photo.webp 800w'});
 run([lazy,ordinary],[picture]);assert.equal(lazy.attributes.src,'https://example.com/photo.jpg');assert.equal(ordinary.attributes.src,'https://example.com/ordinary.jpg');assert.equal(ordinary.attributes.loading,'lazy');assert.equal(picture.attributes.srcset,picture.attributes['data-lazy-srcset']);
});
test('does not replace real images with invalid lazy-load URLs',()=>{
 for(const value of ['javascript:alert(1)','data:image/gif;base64,placeholder','blob:placeholder']){const image=element({src:'https://example.com/real.jpg','data-src':value});run([image]);assert.equal(image.attributes.src,'https://example.com/real.jpg');}
});
