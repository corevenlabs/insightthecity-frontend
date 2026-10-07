const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
function read(name) {
  const module = { exports: {} };
  const source = ts.transpileModule(fs.readFileSync(`src/lib/${name}.ts`, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  new Function('require', 'module', 'exports', source)(path => read(path.replace('./', '')), module, module.exports);
  return module.exports;
}
const { searchCatalog, findHomeResults, matchesPlanTags } = read('homeSearch');
const experiences = [
  { id: '1', title: 'Museo de Brooklyn', description: 'Arte y música', category: 'Museos', tags: ['Arte'], location: 'Brooklyn', region: 'NY', access: 'free', image: 'photo' },
  { id: '2', title: 'Cena en Brooklyn', description: 'Restaurante italiano', category: 'Food', location: 'Brooklyn', region: 'NY', access: 'premium', image: 'photo' },
];
test('busca varias palabras, sin tildes, y combina texto con filtros', () => {
  const items = searchCatalog(experiences, [], [], []);
  assert.deepEqual(findHomeResults(items, 'brooklyn MUSICA', []).map(item => item.id), ['1']);
  assert.deepEqual(findHomeResults(items, 'Brooklyn', ['Food']).map(item => item.id), ['2']);
  assert.equal(findHomeResults(items, 'inexistente', []).length, 0);
  assert.equal(findHomeResults(items, 'Brooklyn', ['NJ']).length, 0);
});
test('guías y NY al día siguen encontrándose con filtros; cada contenido tiene identidad propia', () => {
  const items = searchCatalog(experiences, [{ id: 1, title: 'Brooklyn esencial', coverUrl: null }], [{ id: 1, title: 'Restaurantes en Brooklyn', excerpt: 'Comida local' }], [{ id: 1, title: 'Brooklyn hoy', excerpt: 'Actualidad' }]);
  assert.equal(new Set(items.map(item => item.key)).size, items.length);
  assert.deepEqual(findHomeResults(items, 'Brooklyn', ['Food']).map(item => item.kind).sort(), ['experience', 'guide', 'ny-al-dia', 'que-hacer']);
});
test('planes sin metadatos usan el texto real y no inventan beneficios gratis', () => {
  assert.equal(matchesPlanTags({ title: 'Cena', excerpt: 'Restaurante con reserva' }, ['Food']), true);
  assert.equal(matchesPlanTags({ title: 'Cena', excerpt: 'Restaurante con reserva' }, ['Gratis']), false);
});
